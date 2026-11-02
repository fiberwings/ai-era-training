"""Independently reconcile v17 and verify preserved source evidence and structure."""
import hashlib, json, re, runpy, sys
from pathlib import Path
from lxml import etree as E
ROOT=Path(__file__).resolve().parents[3];HERE=Path(__file__).resolve().parent
w=runpy.run_path(str(HERE/'workbook.py'));T=w['T'];NS=w['NS']
old=w['load'](w['SOURCE']);new=w['load'](w['TARGET']);op=w['sheet_paths'](old);np=w['sheet_paths'](new)
assert list(np)==w['ORDER']
assert len(np)==12
assert hashlib.sha256(w['SOURCE'].read_bytes()).hexdigest()==json.loads((HERE/'inputs.json').read_text())['sourceSha256']
unchanged=['Needs','Rubric','Scores','Coverage','V8 audit','Retirements']
for name in unchanged:assert old[op[name]]==new[np[name]],name
# Retained records and formatting remain exactly the same, allowing column shifts.
for name in ['Offers','Tool track','Build items','Proposed training']:
    a=E.fromstring(old[op[name]]);b=E.fromstring(new[np[name]])
    removed={w['colnum'](c) for c in w['REMOVED'].get(name,set())}
    cells={c.get('r'):c for c in b.findall('.//m:c',NS)}
    count=0
    for c in a.findall('.//m:c',NS):
        col,rn=re.match(r'([A-Z]+)(\d+)',c.get('r')).groups();n=w['colnum'](col)
        if n in removed or name=='Build items' and int(rn)>7:continue
        addr=w['colname'](n-sum(x<n for x in removed))+rn
        actual=cells[addr];expected=E.fromstring(E.tostring(c));expected.set('r',addr)
        assert E.tostring(actual)==E.tostring(expected),(name,addr)
        count+=1
    assert count==len(cells),(name,count,len(cells))
oldstyles=E.fromstring(old['xl/styles.xml']);newstyles=E.fromstring(new['xl/styles.xml'])
for tag in ['fonts','fills','borders','cellXfs']:
    for a,b in zip(oldstyles.find(T(tag)),newstyles.find(T(tag))):assert E.tostring(a)==E.tostring(b)
for name,p in np.items():
    sheet=E.fromstring(new[p]);assert not sheet.findall('.//m:c[@t="e"]',NS),name
    for f in sheet.findall('.//m:f',NS):
        assert '#REF!' not in (f.text or ''),(name,f.text)
        assert not re.search(r'\b(?:Paths|Matrix|Screening)\[|\x27Path detail\x27!',f.text or ''),(name,f.text)
    rp=str(Path(p).parent/'_rels'/(Path(p).name+'.rels'))
    if rp in new:
        for rel in E.fromstring(new[rp]):
            if rel.get('Type','').endswith('/table'):
                tp='xl/'+rel.get('Target')[3:];table=E.fromstring(new[tp]);headers=table.find(T('tableColumns'))
                endcol=re.search(r':([A-Z]+)',table.get('ref'))[1]
                assert len(headers)==w['colnum'](endcol),(name,'table width')
                first=sheet.find('m:sheetData/m:row',NS);ss=w['strings'](new)
                vals={c.get('r'):w['value'](c,ss) for c in first}
                for n,header in enumerate(headers,1):assert vals[w['colname'](n)+'1']==header.get('name'),(name,n)
sys.path.insert(0,str(ROOT/'training-planner/scripts'))
from catalogue_io import read_catalogue
data,checked=read_catalogue(w['TARGET'])
prior=json.loads((ROOT/'training-planner/catalogue-history/9ed4551ae565417e.json').read_text())
ignored={'version','filename','sourceSha256','scoringGuide'}
assert {k:v for k,v in data.items() if k not in ignored}=={k:v for k,v in prior.items() if k not in ignored}
assert checked==9591
report={'workbook':w['TARGET'].name,'sha256':data['sourceSha256'],'snapshot':data['version'],'sheets':list(np),'unchangedWorksheetBytes':unchanged,'retainedCellsAndStylesIdentical':True,'courseOutcomeBuildProposalRetirementObjectsIdentical':True,'coverageRowsReconciled':checked,'formulaErrors':0,'activeCourses':len(data['courses']),'activeScores':sum(len(c['scores']) for c in data['courses']),'unassessed':sum(len(c['unassessed']) for c in data['courses'])}
(HERE/'workbook-verification.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report,indent=2))
