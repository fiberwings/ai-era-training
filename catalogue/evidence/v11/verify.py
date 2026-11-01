"""Verify native preservation and approved changes independently of the editor."""
from pathlib import Path
from zipfile import ZipFile
from lxml import etree as E
import json,re,hashlib,sys
P=Path(__file__).resolve().parent;R=P.parent
NS={'m':'http://schemas.openxmlformats.org/spreadsheetml/2006/main'};T=lambda s:'{'+NS['m']+'}'+s

def load(path):
 with ZipFile(path) as z:p={n:z.read(n) for n in z.namelist()}
 p['_ss']=[''.join(x.itertext()) for x in E.fromstring(p['xl/sharedStrings.xml'])] if 'xl/sharedStrings.xml' in p else []
 return p

def value(c,p):
 if c is None:return None
 if c.get('t')=='inlineStr':return ''.join(c.find(T('is')).itertext())
 v=c.findtext(T('v'))
 if c.get('t')=='s':return p['_ss'][int(v)]
 if c.get('t') in [None,'n']:
  try:return float(v)
  except (TypeError,ValueError):return v
 return v

a=load(P/'before.xlsx');b=load(R/'AI_Era_Cyber_Training_Catalogue_v11.xlsx')
assert set(a)==set(b)
allowed={(int(n),addr):v for n,addr,v in json.loads((P/'edits.json').read_text())}
assert hashlib.sha256((P/'before.xlsx').read_bytes()).hexdigest()=='99e0e8947444068999a2bb9f9196a4f237250bb2ed7b6f73eb808a997a9a743b'
assert (P/'before.xlsx').read_bytes()==(R/'catalogue-archive/AI_Era_Cyber_Training_Catalogue_v10.xlsx').read_bytes()
unchangedparts=0;unchangedcells=0;formulas=0;errors=[]
for name,raw in a.items():
 if name=='_ss':continue
 match=re.fullmatch(r'xl/worksheets/sheet(\d+)\.xml',name)
 if not match:
  if name.startswith('xl/tables/') and E.fromstring(raw).get('name') in ['Rubric','Scores']:
   x=E.fromstring(raw);y=E.fromstring(b[name]);x.set('ref',y.get('ref'));x.find(T('autoFilter')).set('ref',y.find(T('autoFilter')).get('ref'));assert E.tostring(x)==E.tostring(y)
  else:assert raw==b[name],name
  unchangedparts+=raw==b[name];continue
 n=int(match[1]);old=E.fromstring(raw);new=E.fromstring(b[name]);newcells={c.get('r'):c for c in new.findall('.//m:c',NS)}
 for c in old.findall('.//m:c',NS):
  addr=c.get('r');out=newcells[addr]
  assert c.findtext(T('f'))==out.findtext(T('f')),(name,addr,'formula changed')
  if c.find(T('f')) is not None:continue
  if (n,addr) not in allowed:assert value(c,a)==value(out,b),(name,addr,'unapproved input change');unchangedcells+=1
 for c in newcells.values():
  if c.get('t')=='e':errors.append([n,c.get('r'),value(c,b)])
  if c.find(T('f')) is not None:formulas+=1
 for (sheet,addr),v in allowed.items():
  if sheet==n:assert value(newcells.get(addr),b)==v,(n,addr,'authored value mismatch')
 if n==4:
  assert len(new.find(T('sheetData')))==142
 if n==5:assert len(new.find(T('sheetData')))==57952
assert not errors,errors
sys.path.insert(0,str(R/'training-planner/scripts'))
from catalogue_io import read_catalogue
d,checked=read_catalogue(R/'AI_Era_Cyber_Training_Catalogue_v11.xlsx');old=json.loads((P/'before.json').read_text());by={c['id']:c for c in d['courses']}
changed={'N5.1','N5.2','N5.8','R3.1.2','R4.1.3'}
for c in old['courses']:
 for field in ['scores','unassessed']:
  for q,v in c[field].items():
   if q not in changed:assert by[c['id']][field][q]==v,(c['id'],q)
for r in old['requirements']:
 if r['need']=='N8' or r['id']=='N5.4':assert next(x for x in d['requirements'] if x['id']==r['id'])==r
reqs={r['id']:r for r in d['requirements']};assert len(reqs)==140 and 'N5.2' not in reqs and reqs['N5.8']['core']
assert len(d['courses'])==528 and checked==9453
assert sum(len(c['scores']) for c in d['courses'])==57260 and sum(len(c['unassessed']) for c in d['courses'])==280
review=json.loads((P/'reassessments.json').read_text())
for x in review:
 c=by[x['course']];q=x['requirement']
 assert (c['scores'][q]['score'] if q in c['scores'] else None)==x['score']
report={'status':'PASS','unmodifiedNativeParts':unchangedparts,'unchangedInputCells':unchangedcells,'existingFormulasPreserved':True,'formulaCount':formulas,'formulaErrors':errors,'resources':528,'activeOutcomes':140,'retiredOutcomes':['N5.2'],'assessedScores':57260,'unassessedRows':280,'courseNeedResultsReconciled':checked,'N8AndN5_4Unchanged':True,'unchangedOutcomeEvidencePreserved':True,'reassessments':len(review),'workbookSha256':d['sourceSha256'],'catalogueVersion':d['version'],'nativeRecalculation':json.loads((P/'recalculation.json').read_text())}
(P/'verification.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report,indent=2))
