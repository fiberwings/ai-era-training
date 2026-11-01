"""Publish catalogue identity/docs after verification; preserve all plan choices."""
from pathlib import Path
import json,hashlib
ROOT=Path(__file__).resolve().parents[3]
def read(p):return json.loads((ROOT/p).read_text())
def write(p,d): (ROOT/p).write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
def replace(p,changes):
    s=(ROOT/p).read_text()
    for a,b in changes:
        assert a in s,(p,a)
        s=s.replace(a,b)
    (ROOT/p).write_text(s)
cat=read('training-planner/public/data/catalogue.json');v=read('catalogue/evidence/v13/verification.json')
assert cat['version']==v['snapshot'] and cat['filename'].endswith('_v13.xlsx')
baseline=read('.work/catalogue/v13/default-scenario-before.json');scenario=read('training-planner/public/data/default-scenario.json')
assert scenario==baseline
changed={'TR-014','TR-015','TR-023','TR-280'}
def strings(x):
    if isinstance(x,dict):return [s for v in x.values() for s in strings(v)]
    if isinstance(x,list):return [s for v in x for s in strings(v)]
    return [x] if isinstance(x,str) else []
assert not(changed & set(strings(scenario)))
scenario['catalogueVersion']=cat['version']
scenario['assumptions']+=' Catalogue v13 reviewed 1 November 2026: none of TR-014, TR-015, TR-023 or new TR-280 is selected in this retained pathway. Selections, overrides and budgets remain unchanged; catalogue identity refreshed after compatibility review.'
write('training-planner/public/data/default-scenario.json',scenario)
replace('training-planner/public/release.js',[("version: '2.1.0'","version: '2.1.1'")])
config=read('learning-path/config.json');config.update(appVersion='1.3.2',releaseDate='2026-11-01');write('learning-path/config.json',config)
replace('AGENTS.md', [('AI_Era_Cyber_Training_Catalogue_v12.xlsx','AI_Era_Cyber_Training_Catalogue_v13.xlsx'),('catalogue **v12**, snapshot `6db669ed065cab54`',f'catalogue **v13**, snapshot `{cat["version"]}`'),('planner **2.1.0**; learner app **1.3.1**','planner **2.1.1**; learner app **1.3.2**')])
replace('README.md',[('Catalogue v12','Catalogue v13'),('AI_Era_Cyber_Training_Catalogue_v12.xlsx','AI_Era_Cyber_Training_Catalogue_v13.xlsx'),('Training Planner 2.1.0','Training Planner 2.1.1'),('My AI Learning Path 1.3.1','My AI Learning Path 1.3.2'),('v12 evidence','v13 evidence'),('aligned with v12','aligned with v13')])
replace('catalogue/README.md',[('Catalogue v12','Catalogue v13'),('AI_Era_Cyber_Training_Catalogue_v12.xlsx','AI_Era_Cyber_Training_Catalogue_v13.xlsx'),('dated 31 October 2026','dated 1 November 2026'),('528 resources','529 resources'),('57,260 numerical scores','57,400 numerical scores')])
p=ROOT/'catalogue/README.md';s=p.read_text();s=s.replace('## Maintenance','V13 reassesses ISC2 TR-014/TR-015, corrects exam-only TR-023 and adds official SecAI+ training as TR-280. The Pluralsight path TR-155 remains separately assessed. [Review evidence](evidence/v13/README.md) records all decisions, delivery limits and validation.\n\n## Maintenance',1);p.write_text(s)
replace('training-planner/README.md',[('Current release: **2.1.0','Current release: **2.1.1'),('Catalogue **v12**, snapshot `6db669ed065cab54`',f'Catalogue **v13**, snapshot `{cat["version"]}`'),('AI_Era_Cyber_Training_Catalogue_v12.xlsx','AI_Era_Cyber_Training_Catalogue_v13.xlsx')])
replace('learning-path/README.md',[('Release **1.3.1 — 31 October 2026**. Uses the same v12 catalog (528 offerings)','Release **1.3.2 — 1 November 2026**. Uses the same v13 catalog (529 offerings)'),('Catalogue v12 (31 October 2026) reassesses','Previous catalogue update: v12 (31 October 2026) reassessed')])
p=ROOT/'learning-path/README.md';s=p.read_text();marker='Previous catalogue update:';s=s.replace(marker,'Catalogue v13 updates ISC2 evidence and adds official SecAI+ training as TR-280, with exam-only TR-023 kept at zero teaching coverage. The retained central pathway selects none of the affected resources, so its selections and budgets are preserved.\n\n'+marker,1);p.write_text(s)
replace('docs/PROJECT_CONTEXT.md',[
 ('| Catalogue | v12; 31 October 2026; `6db669ed065cab54` | [Workbook](../catalogue/AI_Era_Cyber_Training_Catalogue_v12.xlsx) |',f'| Catalogue | v13; 1 November 2026; `{cat["version"]}` | [Workbook](../catalogue/AI_Era_Cyber_Training_Catalogue_v13.xlsx) |'),
 ('| Builder | 2.1.0;','| Builder | 2.1.1;'),('| Staff app | 1.3.1; 31 October 2026','| Staff app | 1.3.2; 1 November 2026'),
 ('528 resources: 411 Offers','529 resources: 412 Offers'),('57,260 numerical scores','57,400 numerical scores'),('6abef4de79f652a227984bdb67624cebd81ff96a656d33d8414c099ff49ef87c',cat['sourceSha256']),('aligned with v12','aligned with v13')])
p=ROOT/'docs/PROJECT_CONTEXT.md';p.write_text(p.read_text()+f'\n\n## Catalogue v13 — ISC2 and SecAI+ review\n\nPublished 1 November 2026 from the detailed public-syllabus research. TR-014 and its included course TR-015 were reassessed; exam-only TR-023 has zero taught coverage; new TR-280 holds the official CertMaster Perform assessment. TR-155 remains unchanged. All 140 outcomes and 23 groups remain stable. The official-training record states the uncertainty over exact self-paced labs; no full practical credit is inferred. See [v13 evidence](../catalogue/evidence/v13/README.md).\n\nPlanner 2.1.1 and learner 1.3.2 embed snapshot `{cat["version"]}`. No affected resource occurs in retained default selections. Only its catalogue identity and explanatory assumption are refreshed; budgets, selections, overrides, storage keys, schema and model revision remain unchanged. V12 is archived byte-for-byte. The research report remains a baseline analysis, with its decisions now promoted to v13.\n')
replace('docs/INVENTORY.md',[('Current v12 workbook; preserved review evidence for v8–v12.','Current v13 workbook; preserved review evidence for v8–v13. V12 was subsequently archived unchanged.'),('Empty of previous reports; reserved for new active work.','New active research, including the SecAI+/ISC2 review; previous reports remain archived.')])
replace('archive/README.md',[('Original v7–v11 workbooks and v9 archive record. Current v12','Original v7–v12 workbooks and v9 archive record. Current v13')])
p=ROOT/'catalogue/evidence/README.md';p.write_text(p.read_text()+'\nCurrent review: [v13 ISC2 and SecAI+ assessment](v13/README.md), promoted 1 November 2026. Earlier evidence directories remain frozen.\n')
replace('analysis/secai-isc2-framework-review/README.md',[('Status: new research assessment, 1 November 2026. Not promoted into the catalogue or either app.','Status: research completed 1 November 2026; decisions subsequently promoted into catalogue v13 and both apps. The report retains its v12 comparison baseline. See [catalogue update evidence](../../catalogue/evidence/v13/README.md).'),('The workbook owns existing assessments; this separate research does not replace them.','The workbook owns current assessments; the preserved report shows the research basis for the v13 update.')])
replace('analysis/README.md',[('Separate public-syllabus assessment against all 140 outcomes; not promoted into catalogue records or app selections.','Public-syllabus assessment against all 140 outcomes; decisions promoted into catalogue v13. Existing app selections remain unchanged.')])
# Update assertions tied to the intentionally expanded source dataset.
replace('training-planner/tests/core.test.mjs',[('data.courses.length,528','data.courses.length,529'),('length,0),57260','length,0),57400')])
replace('learning-path/tests/core.test.mjs',[('data.catalogue.courses.length,528','data.catalogue.courses.length,529')])
replace('training-planner/tests/verify_proposed_workbook.py',[('checked == 9453','checked == 9476')])
replace('training-planner/tests/component-ui.browser.cjs',[('AI_Era_Cyber_Training_Catalogue_v12.xlsx','AI_Era_Cyber_Training_Catalogue_v13.xlsx')])
src=ROOT/'catalogue/AI_Era_Cyber_Training_Catalogue_v12.xlsx';dest=ROOT/'archive/catalogues'/src.name
assert not dest.exists();src.rename(dest)
assert hashlib.sha256(dest.read_bytes()).hexdigest()=='6abef4de79f652a227984bdb67624cebd81ff96a656d33d8414c099ff49ef87c'
write('catalogue/evidence/v13/scenario-compatibility.json',{'oldCatalogue':baseline['catalogueVersion'],'newCatalogue':cat['version'],'affectedCoursesSelected':[],'changedScenarioFields':['catalogueVersion','assumptions'],'selectionsBudgetsOverridesPreserved':True})
print('Promoted catalogue metadata; retained curriculum choices; archived v12 unchanged.')
