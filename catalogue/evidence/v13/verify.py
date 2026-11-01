"""Check saved catalogue fidelity, evidence changes and cached calculations."""
from pathlib import Path
import json,sys,re,hashlib
from collections import Counter
from statistics import mean
from update import load,tree,cells,strings,value,T,NS,SRC,DST,P,W,ROOT
sys.path.insert(0,str(ROOT/'training-planner/scripts'))
from catalogue_io import read_catalogue

old=json.loads((W/'baseline.json').read_text());new,coverage_rows=read_catalogue(DST)
assert len(new['courses'])==529 and coverage_rows==9476
assert new['requirements']==old['requirements'] and new['needs']==old['needs']
assert new['thresholds']==old['thresholds'] and new['buildItems']==old['buildItems']
assert sum(len(c['scores']) for c in new['courses'])==57400
assert sum(len(c['unassessed']) for c in new['courses'])==280
a={c['id']:c for c in old['courses']};b={c['id']:c for c in new['courses']}
assert b.keys()-a.keys()=={'TR-280'} and not(a.keys()-b.keys())
changed={'TR-014','TR-015','TR-023'}
assert all(a[cid]==b[cid] for cid in a if cid not in changed)
assert 'TR-127' not in b
assess=json.loads((P/'assessment.json').read_text())['decisions']
for cid,decisions in assess.items():
    for rid,d in decisions.items():
        assert b[cid]['scores'][rid]['score']==d['score'],(cid,rid)
        assert b[cid]['scores'][rid]['evidence']==d['evidence']
        assert b[cid]['scores'][rid]['date']=='2026-11-01'
    if cid in a:assert b[cid]['review']==a[cid]['review']
assert all(s['score']==0 for s in b['TR-023']['scores'].values())
assert len(b['TR-280']['scores'])==140
oldparts,newparts=load(SRC),load(DST)
allowed={'xl/worksheets/sheet1.xml','xl/worksheets/sheet3.xml','xl/worksheets/sheet4.xml','xl/worksheets/sheet5.xml','xl/worksheets/sheet6.xml','xl/worksheets/sheet10.xml','xl/worksheets/_rels/sheet10.xml.rels','xl/tables/table2.xml','xl/tables/table5.xml','xl/tables/table8.xml'}
assert oldparts.keys()==newparts.keys()
assert all(oldparts[n]==newparts[n] for n in oldparts if n not in allowed)
formula_count=0;new_formula_count=0;errors=[]
for sn in range(1,17):
    ac,bc=cells(tree(oldparts,sn)),cells(tree(newparts,sn))
    for addr,c in ac.items():
        f=c.find(T('f'))
        if f is not None:
            formula_count+=1
            assert bc[addr].find(T('f')) is not None and f.text==bc[addr].findtext(T('f')),(sn,addr)
        # Existing individual cell formatting is never restyled.
        assert c.get('s')==bc[addr].get('s'),(sn,addr,'style')
    new_formula_count+=sum(c.find(T('f')) is not None for c in bc.values())
    errors += [(sn,addr,c.findtext(T('v'))) for addr,c in bc.items() if c.get('t')=='e']
assert not errors,errors[:5]
assert new_formula_count-formula_count==140*6+23*10
for table in [2,5,8]:
    from lxml import etree as E
    t=E.fromstring(newparts[f'xl/tables/table{table}.xml'])
    assert t.get('ref')=={2:'A1:N9477',5:'A1:Y413',8:'A1:P58092'}[table]

def metrics(c):
    byneed={n['id']:[r for r in new['requirements'] if r['need']==n['id']] for n in new['needs']}
    return {'overall':round(100*mean(mean(c['scores'][r['id']]['score']/3 for r in rs) for rs in byneed.values()),4),
            'positive':sum(s['score']>0 for s in c['scores'].values()),'full':sum(s['score']==3 for s in c['scores'].values())}
report={'workbook':DST.name,'snapshot':new['version'],'sha256':new['sourceSha256'],'resources':529,'activeOutcomes':140,'needs':23,'numericScores':57400,'unassessed':280,'coverageRowsReconciled':coverage_rows,'preservedOriginalFormulas':formula_count,'addedFormulas':new_formula_count-formula_count,'formulaErrors':errors,'unchangedResources':len(a)-len(changed),'metrics':{cid:{'before':metrics(a[cid]) if cid in a else None,'after':metrics(b[cid])} for cid in assess},'nativeFeatures':'All ZIP members outside ten intentional sheet/table/hyperlink changes are byte-identical; original formulas and individual cell styles preserved.'}
(P/'verification.json').write_text(json.dumps(report,indent=2)+'\n')
(W/'verified-catalogue.json').write_text(json.dumps(new,ensure_ascii=False)+'\n')
print(json.dumps(report,indent=2))
