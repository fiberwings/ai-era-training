"""Independent preservation, data and native-recalculation validation."""
from pathlib import Path
from zipfile import ZipFile,ZIP_DEFLATED
from lxml import etree as E
import json,sys,hashlib,re,math
P=Path(__file__).resolve().parent;ROOT=P.parent
NS={'m':'http://schemas.openxmlformats.org/spreadsheetml/2006/main'};T=lambda s:'{'+NS['m']+'}'+s
manifest=json.loads((P/'manifest.json').read_text()); dst=Path(manifest['output']);src=Path(manifest['source'])
if not src.exists():src=ROOT/'catalogue-archive'/src.name
def parts(path):
    with ZipFile(path) as z:return {n:z.read(n) for n in z.namelist()}
def tree(p,n):return E.fromstring(p[f'xl/worksheets/sheet{n}.xml'])
def value(c,p):
    if c is None:return None
    if c.get('t')=='inlineStr':return ''.join(c.find(T('is')).itertext())
    s=c.findtext(T('v'))
    if c.get('t')=='s':return p['_ss'][int(s)]
    if c.get('t') in (None,'n'):
        try:return float(s)
        except (TypeError,ValueError):return s
    return s
def load(path):
    p=parts(path);p['_ss']=[''.join(x.itertext()) for x in E.fromstring(p['xl/sharedStrings.xml'])] if 'xl/sharedStrings.xml' in p else [];return p
if '--uncache' in sys.argv:
    p=parts(dst); count=0
    for name,raw in list(p.items()):
        if not re.fullmatch(r'xl/worksheets/sheet\d+.xml',name):continue
        t=E.fromstring(raw)
        for c in t.findall('.//m:c[m:f]',NS):
            v=c.find(T('v'))
            if v is not None:c.remove(v)
            count+=1
        p[name]=E.tostring(t,encoding='UTF-8',xml_declaration=True)
    out=P/'recalc-in'/dst.name;out.parent.mkdir(exist_ok=True);(P/'recalc-out').mkdir(exist_ok=True)
    with ZipFile(out,'w',ZIP_DEFLATED) as z:
        for n,b in p.items():z.writestr(n,b)
    print(json.dumps({'uncachedFormulaCount':count,'input':str(out)}));sys.exit()

a=load(src);b=load(dst);report={}
assert hashlib.sha256(src.read_bytes()).hexdigest()==manifest['sourceSha256']
for name in a:
    if name in manifest['changedParts'] or name=='_ss':continue
    assert a[name]==b[name],f'Unrelated workbook part changed: {name}'
report['unchangedNativeParts']=sum(a[n]==b[n] for n in a if n!='_ss')
for n in [5,6]:
    old=list(tree(a,n).find(T('sheetData')))[1:];new=list(tree(b,n).find(T('sheetData')))[1:]
    assert len(old)<=len(new)
    for x,y in zip(old,new):assert E.tostring(x)==E.tostring(y),(n,x.get('r'))
report['allExistingScoreAndCoverageRowsUnchanged']=True
existing_ids={d['id'] for d in json.loads((P/'assessments.json').read_text()) if d['action'].startswith('EXISTING:')}
for x,y in zip(tree(a,10).find(T('sheetData')),tree(b,10).find(T('sheetData'))):
    rn=int(x.get('r'));oid=value(x.find(f'm:c[@r="A{rn}"]',NS),a)
    if rn==1:continue
    allowed={'G','H','M','S','X','Y'} if oid in existing_ids else set()
    for cx,cy in zip(x,y):
        cc=re.sub(r'\d','',cx.get('r'))
        if cc not in allowed:assert E.tostring(cx)==E.tostring(cy),(oid,cc)
report['otherExistingCourseCellsUnchanged']=True
errors=[];formula_count=0
for n in range(1,17):
    t=tree(b,n)
    for c in t.findall('.//m:c',NS):
        if c.get('t')=='e':errors.append((n,c.get('r'),value(c,b)))
        if c.find(T('f')) is not None:formula_count+=1
assert not errors,errors
report['formulaCount']=formula_count;report['formulaErrors']=errors
sys.path.insert(0,str(ROOT/'training-planner/scripts'))
from catalogue_io import read_catalogue
data,checked=read_catalogue(dst)
assert checked==9453 and len(data['courses'])==528
new_ids=set(manifest['newIds']);new=[c for c in data['courses'] if c['id'] in new_ids]
assert len(new)==104 and all(len(c['scores'])==140 for c in new)
assert sum(len(c['scores']) for c in data['courses'])==57260
assert sum(len(c['unassessed']) for c in data['courses'])==280
assert len({c['url'].rstrip('/') for c in new})==104
assert all(c['scores']['N4.6']['score']==c['scores']['N6.7']['score']==0 for c in new)
assert next(c for c in new if c['id']=='TR-279')['review']=='Needs delivery validation'
report.update(resources=528,newCourses=104,reviewedOfferings=131,checkedCoverageRows=checked,numericScores=57260,unassessedRows=280)
if '--native' in sys.argv:
    calc=load(P/'recalc-out'/dst.name);different=[];count=0
    for n in range(1,17):
        aa=tree(b,n);bb=tree(calc,n);cells={c.get('r'):c for c in bb.findall('.//m:c',NS)}
        for c in aa.findall('.//m:c[m:f]',NS):
            x=value(c,b); y=value(cells.get(c.get('r')),calc);count+=1
            # Excel and Calc store empty formula strings as either absent or ''.
            same=(x in [None,''] and y in [None,'']) or (isinstance(x,(int,float)) and isinstance(y,(int,float)) and abs(x-y)<1e-9) or x==y
            if not same:different.append((n,c.get('r'),x,y))
    report['nativeRecalculation']={'compared':count,'mismatches':different[:30],'totalMismatches':len(different),'method':'LibreOffice recalculation from a copy with every formula cache removed; published native workbook preserved.'}
    assert not different,different[:30]
(P/'verification.json').write_text(json.dumps(report,indent=2));print(json.dumps(report,indent=2))
