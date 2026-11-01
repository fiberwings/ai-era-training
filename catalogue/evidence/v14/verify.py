"""Verify preservation and independently reconcile saved formula results."""
from assemble import *
import hashlib
sys.path.insert(0,str(ROOT/'training-planner/scripts'))
from catalogue_io import read_catalogue
old=json.loads((W/'baseline.json').read_text());new,checked=read_catalogue(DST)
a={c['id']:c for c in old['courses']};b={c['id']:c for c in new['courses']}
added={'TR-281','TR-282','TR-283','TR-284','TR-285'}
assert set(b)-set(a)==added and not set(a)-set(b)
assert all(a[cid]==b[cid] for cid in a),'An existing resource changed'
assert new['requirements']==old['requirements'] and new['needs']==old['needs']
assert new['thresholds']==old['thresholds'] and new['buildItems']==old['buildItems']
assert len(new['courses'])==534 and checked==9591
assert sum(len(c['scores']) for c in b.values())==58100
assert sum(len(c['unassessed']) for c in b.values())==280
assert 'TR-127' not in b
assert not any('comptia-secai-fundamentals-ai-cybersecurity-basics-cy0-001' in c['url'] for c in b.values())
for cid in added:
    assert len(b[cid]['scores'])==140
    assert all(s['date']=='2026-11-01' and s['score'] in [0,1,2] for s in b[cid]['scores'].values())
    assert b[cid]['url'] in b[cid]['sources']
oldparts,newparts=load(SRC),load(DST)
allowed={'xl/worksheets/sheet1.xml','xl/worksheets/sheet3.xml','xl/worksheets/sheet4.xml','xl/worksheets/sheet5.xml','xl/worksheets/sheet6.xml','xl/worksheets/sheet10.xml','xl/worksheets/_rels/sheet10.xml.rels','xl/tables/table2.xml','xl/tables/table5.xml','xl/tables/table8.xml'}
assert oldparts.keys()==newparts.keys()
assert all(oldparts[n]==newparts[n] for n in oldparts if n not in allowed)
formulas=0;newformulas=0;errors=[]
for sn in range(1,17):
    ac,bc=cells(tree(oldparts,sn)),cells(tree(newparts,sn))
    for addr,c in ac.items():
        if c.find(T('f')) is not None:
            formulas+=1
            assert bc[addr].findtext(T('f'))==c.findtext(T('f')),(sn,addr)
        assert c.get('s')==bc[addr].get('s'),(sn,addr,'style')
    newformulas+=sum(c.find(T('f')) is not None for c in bc.values())
    errors += [(sn,addr,c.findtext(T('v'))) for addr,c in bc.items() if c.get('t')=='e']
assert not errors
assert newformulas-formulas==700*6+115*10
for table,end in [(2,'A1:N9592'),(5,'A1:Y418'),(8,'A1:P58792')]:
    assert E.fromstring(newparts[f'xl/tables/table{table}.xml']).get('ref')==end
report={'workbook':DST.name,'snapshot':new['version'],'sha256':new['sourceSha256'],'resources':534,'addedCourses':sorted(added),'unchangedResources':len(a),'activeOutcomes':140,'needs':23,'numericScores':58100,'unassessedRows':280,'coverageRowsReconciled':checked,'originalFormulasPreserved':formulas,'addedFormulas':newformulas-formulas,'formulaErrors':errors,'nativeFeatures':'All ZIP members outside ten affected sheet/table/hyperlink parts are byte-identical; every original formula and cell style retained.','recalculation':'Artifact Tool compact dependency model, independently reconciled by catalogue importer. Score-change/core-gap probe passed and original inputs restored. Native Excel unavailable; no native save/reopen claimed.','userExclusion':'Mana course absent; no programme selections changed.'}
(P/'verification.json').write_text(json.dumps(report,indent=2)+'\n')
(W/'verified-catalogue.json').write_text(json.dumps(new,ensure_ascii=False)+'\n')
print(json.dumps(report,indent=2))
