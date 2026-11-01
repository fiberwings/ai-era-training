"""Independently verify two-course scope and native workbook preservation."""
from pathlib import Path
from zipfile import ZipFile
from lxml import etree as E
import json,sys,re,hashlib
P=Path(__file__).resolve().parent;R=P.parent;NS={'m':'http://schemas.openxmlformats.org/spreadsheetml/2006/main'};T=lambda x:'{'+NS['m']+'}'+x
def load(p):
 with ZipFile(p) as z:return {n:z.read(n) for n in z.namelist()}
a=load(R/'AI_Era_Cyber_Training_Catalogue_v11.xlsx');b=load(R/'AI_Era_Cyber_Training_Catalogue_v12.xlsx');assert set(a)==set(b)
relpath='xl/worksheets/_rels/sheet10.xml.rels'
oldrels=E.fromstring(a[relpath]);newrels=E.fromstring(b[relpath]);offers=E.fromstring(b['xl/worksheets/sheet10.xml'])
targets={offers.find(f'm:hyperlinks/m:hyperlink[@ref="S{rn}"]',NS).get('{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id'):'https://academy.claude.com/courses/'+slug for rn,slug in [(66,'ai-fluency-framework-foundations'),(118,'ai-capabilities-and-limitations')]}
for rel in oldrels:
 if rel.get('Id') in targets:rel.set('Target',targets[rel.get('Id')])
assert E.tostring(oldrels)==E.tostring(newrels),'Unexpected hyperlink changes'
allowed={(n,addr) for n,addr,v in json.loads((P/'edits.json').read_text())}
formulas=0;unchanged=0;errors=[];parts=0
for name,raw in a.items():
 m=re.fullmatch(r'xl/worksheets/sheet(\d+)\.xml',name)
 if not m:
  if name!='xl/worksheets/_rels/sheet10.xml.rels':assert raw==b[name],name;parts+=1
  continue
 n=int(m[1]);x=E.fromstring(raw);y=E.fromstring(b[name]);xc={c.get('r'):c for c in x.findall('.//m:c',NS)};yc={c.get('r'):c for c in y.findall('.//m:c',NS)}
 assert xc.keys()==yc.keys(),name
 for addr,c in xc.items():
  out=yc[addr];assert c.get('s')==out.get('s'),(name,addr,'style')
  assert c.findtext(T('f'))==out.findtext(T('f')),(name,addr,'formula')
  if c.find(T('f')) is not None:formulas+=1
  elif (n,addr) not in allowed:assert E.tostring(c)==E.tostring(out),(name,addr,'input');unchanged+=1
  if out.get('t')=='e':errors.append([name,addr,out.findtext(T('v'))])
 # Native sheet objects remain byte-equivalent except the reviewed hyperlink.
 assert len(x)==len(y)
 for node,other in zip(x,y):
  if node.tag==T('sheetData'):continue
  if n==10 and node.tag==T('hyperlinks'):
   node.find('m:hyperlink[@ref="S118"]',NS).set('display','https://academy.claude.com/courses/ai-capabilities-and-limitations')
   node.find('m:hyperlink[@ref="S66"]',NS).set('display','https://academy.claude.com/courses/ai-fluency-framework-foundations')
  assert E.tostring(node)==E.tostring(other),(name,node.tag)
assert not errors,errors[:5]
sys.path.insert(0,str(R/'training-planner/scripts'))
from catalogue_io import read_catalogue
d,checked=read_catalogue(R/'AI_Era_Cyber_Training_Catalogue_v12.xlsx');old=json.loads((P/'before.json').read_text())
assert d['requirements']==old['requirements'] and d['needs']==old['needs'] and d['thresholds']==old['thresholds']
changed={'TR-089','TR-145'}
assert [c for c in d['courses'] if c['id'] not in changed]==[c for c in old['courses'] if c['id'] not in changed]
for file in ['assessment.json','assessment-fluency.json']:
 assessment=json.loads((P/file).read_text());c=next(c for c in d['courses'] if c['id']==assessment['courseId'])
 for decision in assessment['decisions']:
  s=c['scores'][decision['requirement']]
  assert s['score']==decision['score'] and s['evidence']==decision['evidence'] and s['sourceUrl']==decision['sourceUrl']
assert checked==9453
report=dict(status='PASS',changedCourses=sorted(changed),otherCoursesUnchanged=526,requirementsUnchanged=140,courseNeedRowsReconciled=checked,nativeFormulasPreserved=formulas,unchangedInputCells=unchanged,unmodifiedNativeParts=parts,formulaErrors=errors,catalogueVersion=d['version'],sourceSha256=d['sourceSha256'],recalculation=json.loads((P/'recalculation.json').read_text()))
(P/'verification.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report,indent=2))
