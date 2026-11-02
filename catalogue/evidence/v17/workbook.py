"""Preserving OOXML assembly for the approved v17 simplification.

Artifact Tool authors the replacement README and scoring-guide additions.
Structural edits retain all unaffected worksheet bytes and formula caches.
"""
from pathlib import Path
from lxml import etree as E
from zipfile import ZipFile
import copy, hashlib, json, re, runpy, sys

ROOT = Path(__file__).resolve().parents[3]
HERE = Path(__file__).resolve().parent
WORK = ROOT / '.work/catalogue/v17'
SOURCE = ROOT / 'catalogue/AI_Era_Cyber_Training_Catalogue_v16.xlsx'
if not SOURCE.exists(): SOURCE = ROOT / 'archive/catalogues/AI_Era_Cyber_Training_Catalogue_v16.xlsx'
TARGET = ROOT / 'catalogue/AI_Era_Cyber_Training_Catalogue_v17.xlsx'
# Reuse the preserved v16 package/style utilities, without running its workflow.
util = runpy.run_path(str(HERE.parent/'v16/workbook.py'))
load, save, xml, strings, inline, merge_styles = [util[k] for k in ['load','save','xml','strings','inline','merge_styles']]
NS=util['NS'];T=util['T'];DOCREL=util['DOCREL']
DROP={'Paths','Path detail','Matrix','Tool adoption','Screening log','Codes'}
ORDER=['Offers','Tool track','Proposed training','Needs','Rubric','Scoring guide','Build items','Scores','Coverage','Retirements','V8 audit','README']
REMOVED={'Offers':{'O','P','W'},'Tool track':{'L'},'Build items':{'D','E'}}
HIDDEN={'Offers':{'J','K','L','M','V'},'Tool track':{'C','J','M'},'Proposed training':{'P','Q','R'}}
def sheet_paths(parts):
    rels={x.get('Id'):x.get('Target') for x in E.fromstring(parts['xl/_rels/workbook.xml.rels'])}
    return {s.get('name'):('xl/'+rels[s.get('{'+DOCREL+'}id')]).replace('xl//','') for s in E.fromstring(parts['xl/workbook.xml']).find(T('sheets'))}
def colnum(s):
    n=0
    for c in s:n=n*26+ord(c)-64
    return n
def colname(n):
    s=''
    while n:n,r=divmod(n-1,26);s=chr(65+r)+s
    return s
def value(c,ss):
    if c is None:return None
    if c.get('t')=='s':return ss[int(c.findtext(T('v')))]
    if c.get('t')=='inlineStr':return ''.join(c.find(T('is')).itertext())
    v=c.findtext(T('v'))
    if v is None:return None
    if c.get('t')=='str':return v
    return float(v) if '.' in v else int(v)
def projection(parts,path):
    out=parts.copy()
    for name,p in sheet_paths(parts).items():
        t=E.fromstring(parts[p]);sd=t.find(T('sheetData'))
        for row in list(sd):
            if int(row.get('r'))> (70 if name in ['README','Scoring guide'] else 4):sd.remove(row)
        for c in t.findall('.//m:c[m:f]',NS):c.remove(c.find(T('f')))
        for tag in ['tableParts','drawing','legacyDrawing','conditionalFormatting','dataValidations','hyperlinks']:
            for x in t.findall('m:'+tag,NS):t.remove(x)
        out[p]=xml(t)
    out={k:v for k,v in out.items() if not k.startswith(('xl/tables/','xl/drawings/','xl/worksheets/_rels/')) and k!='xl/calcChain.xml'}
    save(out,path)
def prepare():
    WORK.mkdir(parents=True,exist_ok=True)
    p=load(SOURCE);ss=strings(p);paths=sheet_paths(p)
    codes=E.fromstring(p[paths['Codes']])
    definitions=[]
    for row in codes.find(T('sheetData')):
        a=value(row.find('m:c[@r="A'+row.get('r')+'"]',NS),ss)
        b=value(row.find('m:c[@r="B'+row.get('r')+'"]',NS),ss)
        if a and b:definitions.append([a,b])
    inputs={'sourceSha256':hashlib.sha256(SOURCE.read_bytes()).hexdigest(),'definitions':definitions}
    (HERE/'inputs.json').write_text(json.dumps(inputs,indent=2,ensure_ascii=False)+'\n')
    projection(p,WORK/'before-view.xlsx')
    historical={str(f.relative_to(ROOT)):hashlib.sha256(f.read_bytes()).hexdigest() for base in ['archive','releases','training-planner/catalogue-history','training-planner/scenario-history'] for f in (ROOT/base).rglob('*') if f.is_file() and not f.name.startswith('.')}
    (WORK/'historical-hashes.json').write_text(json.dumps(historical))
    print('Prepared original definitions, baseline views and historical hashes.')
def assemble():
    parts=load(SOURCE);paths=sheet_paths(parts);auth=load(WORK/'authored.xlsx');ap=sheet_paths(auth);ss=strings(auth)
    offset=merge_styles(parts,auth)
    def authored_sheet(name):
        t=E.fromstring(auth[ap[name]])
        for c in t.findall('.//m:c',NS):
            inline(c,ss);c.set('s',str(int(c.get('s','0'))+offset))
        for tag in ['drawing','tableParts']:
            for e in t.findall('m:'+tag,NS):t.remove(e)
        return t
    parts[paths['README']]=xml(authored_sheet('README'))
    guide=E.fromstring(parts[paths['Scoring guide']]);sd=guide.find(T('sheetData'));rows={r.get('r'):r for r in sd}
    additions=authored_sheet('Scoring guide')
    for ar in additions.find(T('sheetData')):
        rn=ar.get('r');row=rows.get(rn)
        if row is None:sd.append(copy.deepcopy(ar));continue
        for c in ar:
            old=row.find('m:c[@r="'+c.get('r')+'"]',NS)
            if old is not None:row.replace(old,copy.deepcopy(c))
            else:row.append(copy.deepcopy(c))
        if int(rn)>=23:
            for key in ['ht','customHeight']:
                if ar.get(key):row.set(key,ar.get(key))
    # C23 contained the approved explanation underneath an existing merge; show it once in B23.
    oldnote=sd.find('m:row[@r="23"]/m:c[@r="C23"]',NS)
    if oldnote is not None:oldnote.getparent().remove(oldnote)
    merges=guide.find(T('mergeCells'))
    for merge in additions.findall('m:mergeCells/m:mergeCell',NS):merges.append(copy.deepcopy(merge))
    merges.set('count',str(len(merges)))
    guide.find(T('dimension')).set('ref','A1:C51');parts[paths['Scoring guide']]=xml(guide)
    # Remove unused fields while keeping row numbers, formula text and cached values.
    for name in [*REMOVED,'Proposed training']:
        p=paths[name];t=E.fromstring(parts[p]);removed={colnum(c) for c in REMOVED.get(name,set())};hidden={colnum(c) for c in HIDDEN.get(name,set())}
        def shift(n):return n-sum(x<n for x in removed)
        def address(a):
            return re.sub(r'([A-Z]+)(\d+)',lambda m:colname(shift(colnum(m[1])))+m[2],a)
        for row in t.find(T('sheetData')):
            for c in list(row):
                col=colnum(re.match('[A-Z]+',c.get('r'))[0])
                if col in removed:row.remove(c)
                else:c.set('r',address(c.get('r')))
        cols=t.find(T('cols'))
        if cols is not None:
            expanded=[]
            for c in cols:
                for n in range(int(c.get('min')),min(int(c.get('max')),16384)+1):
                    if n in removed:continue
                    e=copy.deepcopy(c);e.set('min',str(shift(n)));e.set('max',str(shift(n)))
                    if n in hidden:e.set('hidden','1');e.set('outlineLevel','1')
                    expanded.append(e)
            cols[:]=expanded
        for tag,attr in [('dimension','ref'),('autoFilter','ref'),('conditionalFormatting','sqref'),('mergeCells/mergeCell','ref'),('dataValidations/dataValidation','sqref'),('hyperlinks/hyperlink','ref'),('sheetViews/sheetView/pane','topLeftCell'),('sheetViews/sheetView/selection','activeCell'),('sheetViews/sheetView/selection','sqref')]:
            for el in t.findall('/'.join('m:'+x for x in tag.split('/')),NS):
                if el.get(attr):el.set(attr,address(el.get(attr)))
        # Table metadata uses the same new column positions, including Lifecycle filter.
        relpath=str(Path(p).parent/'_rels'/(Path(p).name+'.rels'))
        if relpath in parts:
            for rel in E.fromstring(parts[relpath]):
                if rel.get('Type','').endswith('/table'):
                    target=rel.get('Target');tp='xl/'+target[3:] if target.startswith('../') else str(Path(p).parent/target)
                    tt=E.fromstring(parts[tp]);tt.set('ref',address(tt.get('ref')))
                    af=tt.find(T('autoFilter'))
                    if af is not None:
                        af.set('ref',address(af.get('ref')))
                        for fc in af.findall('m:filterColumn',NS):fc.set('colId',str(shift(int(fc.get('colId'))+1)-1))
                    tc=tt.find(T('tableColumns'))
                    for n,c in reversed(list(enumerate(list(tc),1))):
                        if n in removed:tc.remove(c)
                    tc.set('count',str(len(tc)));parts[tp]=xml(tt)
        # Old standalone matrix planning notes are preserved in archived v16.
        if name=='Build items':
            for row in list(t.find(T('sheetData'))):
                if int(row.get('r'))>7:t.find(T('sheetData')).remove(row)
            t.find(T('dimension')).set('ref','A1:D7')
        parts[p]=xml(t)
    wb=E.fromstring(parts['xl/workbook.xml']);sheets=wb.find(T('sheets'));byname={s.get('name'):s for s in sheets}
    rels=E.fromstring(parts['xl/_rels/workbook.xml.rels']);deleted=set()
    for name in DROP:
        p=paths[name];deleted.add(p);rp=str(Path(p).parent/'_rels'/(Path(p).name+'.rels'))
        if rp in parts:
            for rel in E.fromstring(parts[rp]):
                if rel.get('Type','').endswith('/table'):deleted.add('xl/'+rel.get('Target')[3:])
            deleted.add(rp)
        rid=byname[name].get('{'+DOCREL+'}id')
        for rel in list(rels):
            if rel.get('Id')==rid:rels.remove(rel)
    sheets[:]=[byname[n] for n in ORDER]
    for view in wb.findall('m:bookViews/m:workbookView',NS):view.set('activeTab','0');view.set('firstSheet','0')
    for p in ['xl/calcChain.xml',str(Path(paths['README']).parent/'_rels'/(Path(paths['README']).name+'.rels'))]:deleted.add(p)
    for rel in list(rels):
        if rel.get('Type','').endswith('/calcChain'):rels.remove(rel)
    parts['xl/workbook.xml']=xml(wb);parts['xl/_rels/workbook.xml.rels']=xml(rels)
    ct=E.fromstring(parts['[Content_Types].xml'])
    for el in list(ct):
        if el.get('PartName','').lstrip('/') in deleted:ct.remove(el)
    parts['[Content_Types].xml']=xml(ct)
    for p in deleted:parts.pop(p,None)
    # Update Office's sheet inventory (display metadata only).
    if 'docProps/app.xml' in parts:
        app=E.fromstring(parts['docProps/app.xml']);vns={'v':'http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes'}
        for vec in app.xpath('//*[local-name()="TitlesOfParts"]/*'):
            vec[:]=[E.Element('{'+vns['v']+'}lpstr') for n in ORDER]
            for el,n in zip(vec,ORDER):el.text=n
            vec.set('size',str(len(ORDER)))
        for val in app.xpath('//*[local-name()="HeadingPairs"]//*[local-name()="i4"]'):val.text=str(len(ORDER))
        parts['docProps/app.xml']=xml(app)
    save(parts,TARGET);projection(parts,WORK/'after-view.xlsx')
    print('Assembled v17: 12 tabs; retained source rows and assessment caches.')
if __name__=='__main__':globals()[sys.argv[1]]()
