from pathlib import Path
import json
R=Path(__file__).resolve().parent.parent;d=json.loads((R/'training-planner/public/data/catalogue.json').read_text())
assert d['filename']=='AI_Era_Cyber_Training_Catalogue_v11.xlsx'
p=R/'PROJECT_CONTEXT.md';s=p.read_text()
a=s.index('- [AI_Era_Cyber_Training_Catalogue_v10.xlsx]');b=s.index('- Import the workbook',a)
s=s[:a]+"- [AI_Era_Cyber_Training_Catalogue_v11.xlsx](AI_Era_Cyber_Training_Catalogue_v11.xlsx): current catalogue, including the approved must-have review. [V10 is archived](catalogue-archive/AI_Era_Cyber_Training_Catalogue_v10.xlsx). It retains the 104 DeepLearning.AI additions and the corporate-scope exclusion of TR-127. Unchanged outcome evidence is preserved.\n"+s[b:]
s=s.replace('Preserve the source workbook and assessment evidence unchanged. The capability model is now v2; its original is preserved in model-history/.','Preserve historical workbooks and unchanged assessment evidence. Substantive outcome revisions require documented reassessment. The capability model is v2 revision 3; prior documents are preserved in model-history/.')
a=s.index('- Current imported v10 snapshot:');b=s.index('\n- Unassessed resources',a)
s=s[:a]+f"- Current v11 snapshot: 528 resources (411 Offers and 117 Tool track entries), 140 active outcomes, 57,260 numeric scores and 280 explicitly unassessed rows. Version `{d['version']}`; workbook SHA-256 `{d['sourceSha256']}`. TR-017 and TR-045 remain unassessed. N5.2 is retained as a retired workbook record and mapped to N5.1; N5.8 is a new ID.\n".rstrip()+s[b:]
section='''## Approved must-have review — current revision, 18 October 2026

Implemented in catalogue v11, capability model v2 revision 3, annual plan v3 and planner release 1.1.0. N5.1 merges social engineering and deepfake impersonation at awareness depth. N5.2 is retired; its old evidence remains in the workbook and archive. N5.8 adds a separate overview of AI security risks for all cyber staff. N5.4 bank attack examples, N4 generic employee responsible use and all N8 Skill outcomes are unchanged. N6.4 is Accountability. R3.1.2 emphasises a structured testing method; R4.1.3 approved component integrity and change detection.

Must-have flags increase from 55 to 70 including conditional essentials. N11.3 is essential when automated judges are used; R6.1.2 when assurance uses AI. Profile activities record these conditions. R3.1.3 remains in advanced multi-agent testing; N14.7 in leadership; R9.1.2 moves from routine identity operations into identity integration. Core flags change critical-zero/band results without inventing new course evidence. Shared outcomes and learning time are deduplicated; a descendant's activity can make an inherited outcome essential.

All 411 Offers were reviewed against four new/revised outcomes: N5.1, N5.8, R3.1.2 and R4.1.3 (1,636 numeric decisions and eight explicitly unassessed decisions). Reassessment uses retained public-syllabus descriptions/evidence and selected primary-source checks, not gated lesson completion. Other assessment evidence is preserved. Audit sources and native workbook verification are in `.catalogue-v11/`.

Current annual delivery: `analysis/2027-training-plan/2027-Training-Plan-v3.html`, `2027-Training-Plan-v3-Pack.zip` and `2027-recommended-v3.json` (also the distributed default). The prior report, model, crosswalk and distributed planner are preserved in `archive/v2-before-must-have-review-20261018/` with hashes. All four scenarios and 92 profile calculations are rebuilt. The recommended external selections and budgets remain; the benchmark is reoptimised. A new proposed 45-minute Foundation risk overview takes Foundation internal time to 4h45m. It remains unscored. There are 28 recommended internal briefs, plus two coached additions. `change-impact-v3.json` compares every recalculated profile with v2.

Rebuild: import and reconcile the v11 workbook; run `node training-planner/scripts/build_capability_model.mjs`, `node analysis/2027-training-plan/build_plan.mjs --publish`, `python3 analysis/2027-training-plan/compare_v3.py`, `python3 analysis/2027-training-plan/build_report.py`, then `python3 training-planner/scripts/build_standalone.py`. The report builder independently verifies calculations and both annual archive manifests. Existing browser plans are retained and show revision/catalogue warnings; they need explicit review, not silent migration.

'''
s=s.replace('## DeepLearning.AI review — 18 October 2026',section+'## Historical v10 DeepLearning.AI review — 18 October 2026')
s=s.replace('## Current capability model — 17 October 2026','## Capability model structure — introduced 17 October 2026')
s=s.replace('The 140 original outcomes, 23 scored need groups and all source evidence remain unchanged.','The current crosswalk has 140 active outcomes and 23 scored need groups. The approved v11 changes and retired-outcome crosswalk are described above; unchanged source evidence is retained.')
s=s.replace('## Current 2027 annual plan — version 2, 18 October 2026','## Historical annual plan v2 — superseded by v3 above')
s=s.replace('The first numbered planner distribution is **1.0.0**, released **2026-10-18**.','The first numbered planner distribution was **1.0.0**. The current distribution is **1.1.0**, released **2026-10-18**, with catalogue v11 and annual plan v3.')
p.write_text(s)
p=R/'training-planner/README.md';s=p.read_text();s=s.replace('(currently v10)','(currently v11)').replace('The app ships with an editable coverage-first draft and the full catalogue. Its prior selections are retained and marked for review following the v10 catalogue expansion.','The app ships with the editable annual v3 recommendation and the full catalogue. The approved must-have review is recorded in catalogue v11; older plans show review warnings.')
s=s.replace('## Capability model v2 — 17 October 2026','## Capability model v2 revision 3 — 18 October 2026')
s=s.replace('version-2 recommendation','version-3 recommendation')
s=s.replace('[2027 Training Plan — v2](../analysis/2027-training-plan/2027-Training-Plan-v2.html)','[2027 Training Plan — v3](../analysis/2027-training-plan/2027-Training-Plan-v3.html)').replace('It uses the current capability model and catalogue v10.','It uses capability model v2 revision 3 and catalogue v11.').replace('`../analysis/2027-training-plan/archive/v1-before-model-v2-20261018/`.','`../analysis/2027-training-plan/archive/v2-before-must-have-review-20261018/`.')
s=s.replace('The first numbered release is **1.0.0 — 18 October 2026**.','The current release is **1.1.0 — 18 October 2026**.').replace('separately from catalogue v10','separately from catalogue v11')
s=s.replace('AI_Era_Cyber_Training_Catalogue_v10.xlsx','AI_Era_Cyber_Training_Catalogue_v11.xlsx').replace('The current v10 snapshot contains','The current v11 snapshot contains')
s=s.replace('The current [2027 version-2 report](../analysis/2027-training-plan/2027-Training-Plan-v2.html)','The current [2027 version-3 report](../analysis/2027-training-plan/2027-Training-Plan-v3.html)').replace('27 proposed internal modules','28 proposed internal modules')
s=s.replace('## V2 verification — 17 October 2026','## Historical v2 verification — 17 October 2026').replace('## DeepLearning.AI catalogue review — 18 October 2026','## Historical v10 DeepLearning.AI catalogue review — 18 October 2026')
s=s.replace('The subsequently approved annual-plan update now supplies the curated version-2 starter.','The subsequently approved annual-plan updates supply the curated version-3 starter.')
text='''### Approved essential-outcome review

N5.8 is the new cyber risk overview; N5.4 remains bank-specific attack examples. N5.1 combines social engineering and deepfake impersonation, with N5.2 retired and cross-referenced. N4 and N8 are unchanged; N6.4 is Accountability. There are 140 active outcomes, 23 equally weighted needs and 70 must-have flags including conditional essentials. Four revised/new outcomes were reassessed across all 411 Offers; other evidence is preserved.

Use the profile editor's activity checkboxes for automated judges (N11.3) and AI-assisted assurance (R6.1.2). Detailed identity delegation (R9.1.2) belongs to identity integration. Shared outcomes remain counted once when a descendant adds an essential condition. The workbook's full-need Coverage includes conditional essentials; profile calculations apply the recorded responsibilities and activities.

Older model-revision plans show a warning. In Scenario settings, applying revised applicability marks cohorts for fresh selection review and discards stale recommendations. Existing choices and internal proposals are retained; retired IDs must be reviewed explicitly. Browser-local scenarios are never overwritten by the distributed default.

All four annual scenarios are recalculated (92 profile calculations); `change-impact-v3.json` retains before/after results. The curated courses and budgets are retained; the diagnostic benchmark is reoptimised. The Foundation adds a proposed 45-minute internal risk overview, bringing its internal time to 4h45m. Proposed internal work has no assessed coverage credit.

'''
s=s.replace('### Maintaining the model',text+'### Maintaining the model')
s=s.replace('before packaging. `scripts/seed.mjs`','then `python ../analysis/2027-training-plan/compare_v3.py` and `python ../analysis/2027-training-plan/build_report.py` before packaging. `scripts/seed.mjs`')
p.write_text(s)
