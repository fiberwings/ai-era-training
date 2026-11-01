"""Independent data, scope, preservation and (optional) recalculation checks."""
import pathlib,json,zipfile,hashlib,collections,math,sys
import openpyxl
from lxml import etree as E
R=pathlib.Path(__file__).resolve().parent
C=json.loads((R/'compiled.json').read_text());D=json.loads((R/'original.json').read_text())
file=pathlib.Path(sys.argv[1]) if len(sys.argv)>1 else R.parent/'AI_Era_Cyber_Training_Catalogue_v8.xlsx'
w=openpyxl.load_workbook(file,read_only=True,data_only=True)
errors=[];mismatches=[];pairs=set();byoffer=collections.Counter()
for i,(row,r) in enumerate(zip(w['Scores'].iter_rows(min_row=2,values_only=True),C['records']),2):
    expected=[r['offer'],r['title'],r['req'],r['need'],r['requirement'],r['score']]
    if list(row[:6])!=expected:mismatches.append(('Scores',i,list(row[:6]),expected))
    assert (row[0],row[2]) not in pairs;pairs.add((row[0],row[2]));byoffer[row[0]]+=1
    assert row[5] in (None,0,1,2,3)
    assert row[12]==('Unassessed' if row[5] is None else 'Assessed')
    assert row[13]==r['prior']
assert len(pairs)==43120 and len(byoffer)==308 and set(byoffer.values())=={140}
assert w['Scores'].max_row==43121 and w['Coverage'].max_row==7085
for i,(row,r) in enumerate(zip(w['Coverage'].iter_rows(min_row=2,values_only=True),C['coverage']),2):
    expected=[r[k] for k in ['offer','title','need','name','level','rank','scope','scored','pct','core','gaps','at3','band']]
    for j,(a,b) in enumerate(zip(row,expected),1):
        if (abs(a-b)>1e-10 if isinstance(a,(int,float)) and isinstance(b,(int,float)) else a!=b):mismatches.append(('Coverage',i,j,a,b))
    assert r['pct']<=1 and r['gaps']<=r['core'] and r['scored']<=r['scope']
reqs={r[0]:r for r in D['Rubric'][1:]};rq=collections.defaultdict(list)
for r in C['records']:rq[r['req']].append(r['score'])
for row in w['Rubric'].iter_rows(min_row=2,values_only=True):
    vs=rq[row[0]];expected=[max((v for v in vs if v is not None),default=0),vs.count(3),vs.count(2)]
    if list(row[11:14])!=expected:mismatches.append(('Rubric',row[0],row[11:14],expected))
best={q:max((v for v in vs if v is not None),default=0) for q,vs in rq.items()}
for row in w['Needs'].iter_rows(min_row=2,values_only=True):
    qs=[q for q,r in reqs.items() if r[1]==row[0]]
    expected=[sum(best[q]==3 for q in qs),sum(best[q]<2 for q in qs),
              sum(c['need']==row[0] and c['band'] in ['Full','Strong'] for c in C['coverage']),
              sum(c['need']==row[0] and c['band']=='Partial' for c in C['coverage'])]
    if list(row[10:14])!=expected:mismatches.append(('Needs',row[0],row[10:14],expected))
for addr,expected in {'B67':sum(v==3 for v in best.values()),'B68':sum(v<2 for v in best.values()),
                      'B69':42840,'B70':7084,'B71':C['stats']['fullstrong']}.items():
    if w['README'][addr].value!=expected:mismatches.append(('README',addr,w['README'][addr].value,expected))
for s in w:
    for row in s:
        for x in row:
            if x.data_type=='e':errors.append((s.title,x.coordinate,x.value))
for row,old in zip(w['Offers'].iter_rows(min_row=2,values_only=True),D['Offers'][1:]):
    for j in range(25):
        if j not in [14,21,22,23,24]:
            assert row[j]==old[j],('Unauthorised Offers change',old[0],j,row[j],old[j])
source=R.parent/'AI_Era_Cyber_Training_Catalogue_v7.xlsx'
assert hashlib.sha256(source.read_bytes()).hexdigest()==C['stats']['original_sha256']
preserved=[]
if file.name=='AI_Era_Cyber_Training_Catalogue_v8.xlsx':
    with zipfile.ZipFile(source) as a,zipfile.ZipFile(file) as b:
        for i in [7,8,9,11,12,13,14,15]:
            p=f'xl/worksheets/sheet{i}.xml';assert a.read(p)==b.read(p);preserved.append(p)
    f=openpyxl.load_workbook(file,read_only=False,data_only=False)
    assert f['Scores'].tables['Scores'].ref=='A1:P43121'
    assert f['Coverage'].tables['Coverage'].ref=='A1:N7085'
    assert 'Scores[Score],"<>"' in f['Coverage']['H2'].value
    assert f['Coverage']['M2'].value.startswith('=IF(Coverage[[#This Row],[Scored]]=0,"Unassessed",')
    assert f['Scoring guide']['B11'].value==.7 and f['Scoring guide']['B12'].value==.3
    f.close()
result={'file':str(file),'score_pairs':len(pairs),'offers':len(byoffer),'coverage_rows':7084,
        'mismatches':mismatches,'formula_errors':errors,'original_unchanged':True,'byte_preserved_sheets':preserved}
print(json.dumps(result,indent=2));(R/(file.stem+'-validation.json')).write_text(json.dumps(result,indent=2))
assert not errors and not mismatches
