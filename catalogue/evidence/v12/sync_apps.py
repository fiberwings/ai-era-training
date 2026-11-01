"""Refresh application data identities and documentation, preserving static analyses."""
from pathlib import Path
import json,re,hashlib
R=Path(__file__).resolve().parent.parent
def read(p):return json.loads(p.read_text())
def write(p,d):p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
d=read(R/'training-planner/public/data/catalogue.json')
p=R/'training-planner/public/data/default-scenario.json';s=read(p)
s['catalogueVersion']=d['version']
s['assumptions']+=' App catalogue refreshed to v12 on 31 October 2026 for TR-089 and TR-145. Annual-plan selections and budgets are retained; the previous static annual analysis remains on its original snapshot.'
write(p,s)
p=R/'training-planner/public/data/capability-crosswalk.json';s=read(p);s['catalogueVersion']=d['version'];write(p,s)
note='Catalogue v12 (31 October 2026) reassesses two Anthropic courses using public lessons and exercises. TR-145 is a 3.5h Foundation AI-limitations course with L1 practice (N3 76%, N6 54%). TR-089 is a 4h L1 AI-fluency course with supporting Foundation content (N6 67%); its four core N6 outcomes have full teaching and practice. These aggregate bands remain Partial. Other courses and the 140-outcome rubric are unchanged. Previous static analyses retain their original catalogue snapshots.'
p=R/'README.md';s=p.read_text().replace('Training catalogue v11','Training catalogue v12').replace('AI_Era_Cyber_Training_Catalogue_v11.xlsx','AI_Era_Cyber_Training_Catalogue_v12.xlsx').replace('**2.0.5 (31 October 2026)**','**2.0.6 (31 October 2026)**').replace('catalogue **v11**','catalogue **v12**').replace('My AI Learning Path 1.3.0','My AI Learning Path 1.3.1').replace('unchanged legacy annual scenario','legacy annual selections with refreshed catalogue evidence');s=s.replace('## Use and maintain the planner',note+'\n\n## Use and maintain the planner');p.write_text(s)
p=R/'training-planner/README.md';s=p.read_text().replace('## Current release: 2.0.5','## Current release: 2.0.6').replace('currently v11','currently v12').replace('The current v11 snapshot','The current v12 snapshot').replace('AI_Era_Cyber_Training_Catalogue_v11.xlsx','AI_Era_Cyber_Training_Catalogue_v12.xlsx');s=s.replace('Release 2.0.5 removes',note+' The app’s bundled scenario retains the annual plan’s decisions with a refreshed catalogue identity; previous analysis files are unchanged.\n\nRelease 2.0.5 removes',1)
s=re.sub(r'The catalogue is still \*\*v11\*\*.*?Crosswalks add',f'The current catalogue is **v12**, snapshot **{d["version"]}**. TR-089 and TR-145 were reassessed on **31 October 2026**; other assessments retain their original dates. Workbook SHA-256: `{d["sourceSha256"]}`. All **9,453** course/need rows reconcile. Model applicability remains version 2, revision 3. Crosswalks add',s)
s=s.replace('The current release is **2.0.1 — 31 October 2026**','The current release is **2.0.6 — 31 October 2026**');p.write_text(s)
p=R/'learning-path/README.md';s=p.read_text().replace('Release **1.3.0 —','Release **1.3.1 —').replace('same v11 catalog','same v12 catalog');s=s.replace('## ',note+' Learner release 1.3.1 embeds this update.\n\n## ',1);p.write_text(s)
p=R/'PROJECT_CONTEXT.md';s=p.read_text();s=s.replace('[AI_Era_Cyber_Training_Catalogue_v11.xlsx](AI_Era_Cyber_Training_Catalogue_v11.xlsx): current catalogue, including the approved must-have review.','[AI_Era_Cyber_Training_Catalogue_v12.xlsx](AI_Era_Cyber_Training_Catalogue_v12.xlsx): current catalogue, including the approved must-have review and 31 October Anthropic course reassessments. V11 remains at its original root path for traceability.')
s=s.replace('Current v11 snapshot:','Current v12 snapshot:').replace('Version `6f245643cc5bf083`; workbook SHA-256 `bcd2a5400a708d32fec79cf22c97840c5d131de1405e7a6c2ce97cec2e686e09`',f'Version `{d["version"]}`; workbook SHA-256 `{d["sourceSha256"]}`')
s+='\n\n## Anthropic catalogue review — 31 October 2026\n\n'+note+'\n\nPlanner 2.0.6 and learner companion 1.3.1 embed v12. Only the catalogue, apps and their maintenance documentation are refreshed; prior static analyses and annual-report packs are unchanged. The bundled app scenario keeps its selected courses and budgets. Review decisions and native-workbook checks are in `.catalogue-v12/`.\n';p.write_text(s)
print('Updated application catalogue identities and documentation; static analyses untouched')
