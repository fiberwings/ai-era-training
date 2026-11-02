# Project context

Current as of 2 November 2026. This is the current handover; the [31 October handover](history/PROJECT_CONTEXT-2026-10-31.md) remains unchanged as historical evidence.

## Purpose

Prepare the company's cybersecurity workforce for an agentic AI operating model through a capability framework, evidence-based course catalogue, adaptable organisational pathways, individual learning plans and explanatory presentations. Functional heads need practical options within time budgets, clear evidence and visibility of gaps that require internal development.

The six live deliverables and their entry points are in the [root README](../README.md). [AGENTS.md](../AGENTS.md) supplies working rules, source relationships and build/test commands.

## Decisions on 1 November 2026

1. Adopt the deliverable-based directory structure in [the inventory](INVENTORY.md), using the existing Git repository.
2. Archive the 2027 training plan as outdated. Future annual planning is new work; the old report is not a current recommendation.
3. Archive the Foundation/L1 review as no longer needed.
4. Keep both the model briefing and the additional capability-needs deck as live presentation deliverables.
5. Keep the existing app defaults for now. This explicit decision preserves the learner's bundled annual selections and the planner's legacy starter while the component workspace continues to start blank. It does not reactivate the archived report.
6. Preserve existing personal/browser plans, catalogue evidence and historical snapshots. The reorganisation changes locations and guidance, not curriculum content or application behaviour.
7. Create Recommended Training Pathways as a sixth deliverable. Foundation/L1 is Reviewed; other recommendations are AI recommendation - to be reviewed. These selections are a separate planner import, with their own version and decision record.
8. Subsequently publish these recommendations in the learner app, as explicitly requested. This supersedes decision 5 for the learner bundle only; the legacy planner default and personal learning records remain preserved.
9. Rename the learner interface **AI Cybersecurity Learning**. Remove the “Small steps. Useful skills.” and “A plan that fits your week” panels, weekly learning-hour display/profile control, and associated pace estimates. Keep existing browser data and backup fields compatible.
10. Add training completion counts and progress bars to the For you overview’s four pathway cards. Track available central training and personal commitments, with separate upcoming/optional counts. Reuse shared completion across relevant layers and deduplicate within each layer; completion remains self-reported.
11. Add Specialisation and Tool dropdowns to Explore training’s Filters panel. Learners can explore all nine roles, specific responsibilities and catalogue tools independently of their saved profile; filters combine with search and existing controls.

## Decision on 2 November 2026

Implement the approved learning-app mock-up within the existing design: retain the four overview/progress cards and scrolling Foundation, selected level, specialisation and tool sections. Within each section, show Central recommendations first and Suggested for you separately below. Keep empty central states visible, explain shared Foundation learning, and distinguish pending AI selection review from proposed internal delivery. Catalogue matching remains optional; adding a course does not change its recommendation source.

## Current versions and authority

| Item | Current identity | Authority |
| --- | --- | --- |
| Catalogue | v16; 2 November 2026; `9ed4551ae565417e` | [Workbook](../catalogue/AI_Era_Cyber_Training_Catalogue_v16.xlsx) |
| Framework | Version 2, revision 3 | [Model](../capability-framework/Agentic-Era_Workforce_Capability_Model.md) |
| Recommended pathways | Version 0.2; 2 November 2026; partially reviewed Draft | [Decision source](../recommended-pathways/Recommended-Training-Pathways.json) and [generated guide](../recommended-pathways/Recommended-Training-Pathways.md) |
| Builder | 2.2.1; 2 November 2026 | `training-planner/public/release.js` and source |
| Staff app | 1.6.1; 2 November 2026 | `learning-path/config.json` and source |
| Bundled legacy pathway | 2027 v3, revision 3; Draft | `training-planner/public/data/default-scenario.json`, retained by explicit choice |
| Component starter | Schema 3; blank curriculum | `training-planner/public/data/component-starter.json` |

The active catalogue has 516 resources: 403 Offers and 113 Tool track entries; 140 active outcomes across 23 scoring groups; 56,140 numerical scores and 280 explicitly unassessed rows, plus one proposed internal brief. The workbook also preserves 18 retired records and their assessments. Workbook SHA-256: `07a1829aeadffbe170d8aa1ebcf7d03e61b5248a9c8e53c990930fae22a1d6eb`.

The model document defines the agreed framework. The workbook supplies assessments and evidence. The generated app catalogue is a faithful imported snapshot. The model generator combines those outcomes with the versioned applicability and explanatory modules; its output includes the model document and CSV/JSON crosswalks. Source changes must preserve consistency with the agreed model.

Catalogue v12 reassessed TR-089 and TR-145 on 31 October; it did not refresh the old static analyses. Unchanged assessments retain their dates. Retired N5.2 remains historical and maps to revised N5.1; N5.8 is the separate cyber-risk overview.

## How the deliverables connect

The recommended-pathways scenario owns the maintained recommendation and its review decisions. Its guide, internal briefs and outcome coverage record are generated from the scenario and its exact saved catalogue snapshot using the shared model/scoring modules. It can be imported into the component planner as a separate schema-3 plan. Its version and review status are independent of application releases. It is now the learner publication source; the blank starter and retained legacy planner default remain separate.

The saved, recalculated Excel workbook is validated/imported into `training-planner/public/data/catalogue.json`. Planner model modules supply role, level, tool and outcome applicability. The model/crosswalk builder creates the human-readable framework and mapping files. The planner packager embeds current data, both starter formats, application code and the solver into `Training-Planner.html`.

The learner build reads that same catalogue, shared model/scoring modules and Recommended Training Pathways v0.2, then writes its standalone `index.html`. It preserves native schema-3 components and audience variants, deriving compatibility groups for existing profiles and saved central scopes. Schema-2 imports remain supported. Personal selections, progress and feedback stay separate from central recommendations.

The presentations are editable PowerPoint deliverables. Their historical authoring chain is retained in [presentations/source](../presentations/source/README.md). The model briefing's catalogue appendix was built from v10; review that dated content before presenting it as aligned with the current catalogue. No deck content was refreshed during this reorganisation.

## Product decisions to preserve

- Foundation + agentic level + role specialisms + tool training are independent dimensions. Foundation is common knowledge; levels describe work with agents, not seniority. There are nine model roles with responsibility packages.
- Training coverage measures published curriculum evidence, not learner competence, course quality or operational authorisation. Tool metadata and internal delivery status do not create assessment evidence.
- The planner supports blank component curricula, shared teaching, audience-specific variants, detailed course/outcome evidence, manual internal teaching, time budgets, CSV/print and JSON backup.
- Internal linked outcomes contribute to planned coverage; assessed catalogue coverage remains distinct. Recommendations optimise assessed coverage. Preserve deduplication and full-course time estimates.
- Existing schema-1/2 plans retain their interpretation in the legacy workspace. Saved browser plans are never automatically cleared or converted.
- The staff app provides Foundation, one level, chosen roles/responsibilities and tools, plus search, commitments, progress and feedback. Target work and suggested starting point remain separate.
- Microsoft Forms has no configured destination. Feedback is locally saved/exportable; central collection requires connecting a real form. Submission confirmation is self-reported. There are no user accounts, automatic enrolments or background synchronisation.

## Planner 2.0.9 correction — 1 November 2026

Internal learning now follows catalogue course selection behaviour: a component lists only its own items, with prerequisite items shown separately under Inherited learning and labelled by source component. Audience paths and cumulative coverage/time still include shared teaching once. Adding or editing an internal brief from the component editor stays bound to that component, even after browsing the catalogue with a different destination. A brief started in the catalogue respects its explicit destination. Existing saved assignments and backup/storage formats are preserved.

Verification: 67 planner JavaScript checks, 14 Python checks and two browser regressions passed. The standalone HTML and current ZIP are rebuilt as 2.0.9; catalogue, model, starter curricula and learner app are unchanged. See [planner QA](../training-planner/qa/README.md).

## Planner 2.1.0 — proposed-training Excel register

The component planner exports all current-scenario internal assignments into a distinct Proposed training tab in a user-selected catalogue workbook, downloading an updated copy. It preserves the original workbook's assessment sheets, cached formulas and styles. Stable scenario/component/item IDs support updates while retaining other saved proposals and audience-specific variants. All brief fields and component/scenario context are retained. Workbook rows can be previewed and added/updated in an explicitly chosen component; they do not become assessed catalogue courses or automatic starter selections.

The catalogue importer retains this optional register separately as `proposedTraining`; future intentional refresh/builds expose a saved-proposal picker. Existing v12 source workbook/snapshot, retained starter plans, framework/model identities and learner app remain unchanged. Workbook saving and formal catalogue publishing are separate actions. See the [planner workflow](../training-planner/README.md#save-proposed-internal-training-in-excel) and [catalogue guide](../catalogue/README.md#proposed-internal-training).

## Historical material and future work

[Archive index](../archive/README.md) lists the frozen reports, workbooks, model versions and older distributions. Historical handovers and scripts can contain obsolete paths or decisions; they are provenance, not current operating instructions. The Git checkpoint `182e18c` preserves the pre-move layout.

The active `analysis/` folder holds new work. Schema-3 learner publication is now implemented by explicit user request. Replacing the retained legacy planner default, connecting Forms and updating dated presentation content remain separate future tasks. None was silently performed during reorganisation.


## Catalogue v13 — ISC2 and SecAI+ review

Published 1 November 2026 from the detailed public-syllabus research. TR-014 and its included course TR-015 were reassessed; exam-only TR-023 has zero taught coverage; new TR-280 holds the official CertMaster Perform assessment. TR-155 remains unchanged. All 140 outcomes and 23 groups remain stable. The official-training record states the uncertainty over exact self-paced labs; no full practical credit is inferred. See [v13 evidence](../catalogue/evidence/v13/README.md).

Planner 2.1.1 and learner 1.3.2 embed snapshot `ba0634eb6d9be98d`. No affected resource occurs in retained default selections. Only its catalogue identity and explanatory assumption are refreshed; budgets, selections, overrides, storage keys, schema and model revision remain unchanged. V12 is archived byte-for-byte. The research report remains a baseline analysis, with its decisions now promoted to v13.


## Catalogue v14 — missing Udemy SecAI+ courses

Published 1 November 2026. Adds TR-281 CertMike (4.6/580 ratings), TR-282 Avnish Singh/Pavan Kumar (4.5/559), TR-283 Alexander Oni (4.5/67), TR-284 Nasser Alaeddine (4.8/31) and TR-285 Vision Training Systems (4.7/28). Shortlist: taught courses with at least 4.5/5 and 25 course ratings; public curricula independently assessed across 140 outcomes each. Ratings are selection evidence, not coverage or competence. Mana's course is excluded by explicit user quality decision; Vinay Kumar's INT-1199 remains unduplicated. See [v14 evidence](../catalogue/evidence/v14/README.md).

Planner 2.1.2 and learner 1.3.3 embed snapshot `d9c478c4687192a0`. All 529 existing resources and their assessments remain identical. Added courses are not selected automatically. Retained selections, budgets, overrides, storage keys, scenario schema and model 2 revision 3 are preserved. The default's catalogue identity and explanatory assumption are refreshed after comparison. V13 is archived byte-for-byte; earlier reports, evidence, presentations and packages remain unchanged.


## Catalogue v15 — internal learning becomes catalogue content

On 1 November 2026 the user clarified that internal learning must actually be added to the maintained catalogue, beyond providing an export feature. The saved Foundation brief **AI use cases** was exported from the user's open planner and promoted into the **Proposed training** worksheet. Its title, unassigned owner, 1 learner hour, Proposed status, complete teaching description, N1.1–N1.3 links, component/scenario context and stable IDs are preserved. The source record is retained in [v15 evidence](../catalogue/evidence/v15/README.md).

Planner 2.1.3 exposes saved internal training directly in Full catalogue through the Training type selector. Search, detail preview and an explicit destination let planners reuse a brief in a new plan without reopening Excel. Assignments remain component-specific and prerequisite teaching is inherited separately. The entry remains planned teaching, with no invented assessed scores.

Catalogue snapshot `ff6d5a46d0450171` includes 534 existing resources plus one internal training record. All existing course/outcome data, assessments, worksheet XML and formula caches are unchanged from v14. The retained schema-2 default receives only the new catalogue identity; selections, assumptions, budgets and overrides are unchanged. The blank component starter stays blank. Learner 1.3.4 embeds the same catalogue but the new brief is not automatically assigned. V14 is archived byte-for-byte.

## Recommended Training Pathways v0.1

Published as a partially reviewed draft on 1 November 2026. The [editable schema-3 scenario](../recommended-pathways/Recommended-Training-Pathways.json) owns selections and review decisions; the [guide](../recommended-pathways/Recommended-Training-Pathways.md), internal brief register and detailed coverage record are generated from it using catalogue v15 snapshot `ff6d5a46d0450171` and model 2 revision 3.

Foundation/L1 is **Reviewed** by user instruction: TR-281 CertMike SecAI+, TR-145 Anthropic AI Capabilities and Limitations, and the saved one-hour **AI use cases** internal brief. The courses are assigned once in Foundation and inherited by L1 and higher pathways. The combined baseline is **10h 41m**. The internal brief retains its complete catalogue content, stable ID, N1.1–N1.3 links, Proposed delivery status and unassigned owner.

L2, L3, specialist, coached and tooling recommendations are **AI recommendation - to be reviewed**. The scenario includes 28 reusable components/variants and 26 audience paths covering all nine roles. Historical course selections and internal activity IDs are retained for the 19 specialist branches, with variants preventing accidental extra teaching in architecture, assurance, forensics, red-teaming and IAM integration. Internal teaching remains proposed; suggested facilitators are separate from unassigned accountable owners. Budgets, dates and product training remain unset.

TR-229 **Reasoning with o1** is excluded from the new recommendation. The user's reference to O2 was interpreted as this model-specific course in the previous plan; no separate O2 course was selected. The L3 addition is now 14h 59m of catalogue learning plus 9h internal practice. TR-127 remains excluded. The archived reports and retained application defaults were not republished.

Coverage uses the existing best-score/equal-need method, with planned internal teaching distinct from assessed evidence and shared time deduplicated. Reviewed Foundation/L1 does not imply complete coverage or measured competence. Review labels are visible rationale text and metadata; no changed-input review gate is restored. The scenario remains Draft overall. Import/export was verified in an isolated browser; existing saved plans were preserved in the test. Nineteen component regression checks passed. See [verification](../recommended-pathways/verification.json).


## Learner 1.4.0 — quick onboarding

The learner app now starts with one form: selected L1/L2/L3, broad responsibility areas (the nine model roles), planned tools, and optional Python/Git comfort. It opens the path immediately without a quiz, responsibility-package details, tool tasks, activity questions, name, experience or weekly-hours questions. Foundation stays included. New responsibility areas include their packages; existing refined selections are preserved. My profile retains the detailed editor and an optional starting-point assessment.

Quick setup leaves task/activity answers unspecified. Tools without explicit task preferences use the chosen level to filter suggestions (use; use/supervision; use/supervision/building); administration is not inferred. Conditional essentials still require explicit Yes answers. Without saved checks, learning begins at the chosen level. Existing checks remain valid starting-point guidance and never lower the target. The existing two-hour planning pace remains editable in My profile.

The profile adds an optional `quickSetup` boolean within pathVersion 4; storage keys, backup schema, personal commitments, feedback, central scope snapshots and review behaviour are preserved. Catalogue v15, model 2 revision 3 and the retained Draft central selections are unchanged. Verification: 70 learner JavaScript checks, 3 Python checks and 3 desktop/mobile browser regressions passed; the standalone HTML and versioned ZIP are rebuilt.


## Learner 1.5.0 — published recommendations

By explicit user request, the learner app publishes Recommended Training Pathways v0.1. The build reads its native schema-3 source and retains all 28 components and 26 audience paths. Shared courses and internal learning are inherited once; specialist combinations follow their specific variants. Derived compatibility groups preserve older profile and central-scope handling without changing the source recommendations. Schema-2 central imports remain supported.

Foundation/L1 carries the Reviewed label, including TR-281, TR-145 and the one-hour AI use cases brief. Other recommendations show AI recommendation - to be reviewed. Review status does not alter delivery readiness: Proposed internal sessions remain upcoming and cannot be committed or completed. TR-229 and TR-127 stay excluded from new recommendations and tailored suggestions, while existing personal records remain visible. L2/L3 learners explicitly choose standard or coached routes; coding comfort does not silently select a route.

Single-form onboarding, storage keys, pathVersion 4, backup schema, commitments, notes, completion history and feedback are preserved. The optional profile field `learningRoute` stores the route choice. Existing central-scope review behaviour remains separate from recommendation review labels.

Verification: 77 learner JavaScript checks, 3 Python checks and 5 desktop/mobile browser regressions passed. All 25 L1–L3 audience paths match planner course/internal selections, scope and assessed coverage. See [release evidence](../learning-path/qa/publication-1.5.0.json). The standalone HTML and versioned ZIP are rebuilt; catalogue v15 and model 2 revision 3 are unchanged.


## Planner 2.2.0 — specialism and tool pathways

Learning components now presents responsibility packages as pathway cards, using the same editor, course budgets, assessed recommendations and internal practice as Foundation/L1/L2/L3. A role filter covers all nine model roles; shared packages appear once. Section links provide direct access to shared learning, specialisms and tool pathways.

Create tool pathway records an approved product, intended tasks and optional budget. Find training for this tool opens a product-and-task filtered catalogue with preview/add actions and full-course budget fit, including explicit unresolved durations. All catalogue resources remain available for manual review. Product/task metadata is discovery evidence only and creates no assessed coverage. Tool pathways compose into audience paths using the existing schema-3 components.

Catalogue v15, model 2 revision 3, maintained recommendation choices, both planner starters, storage keys and saved-plan formats are retained. This release changes only the planner and its distribution.

## Learner 1.6.0 — separate recommendation sources

The For you page preserves the existing four progress cards, navigation, course cards and scrolling layer order. Every configured layer or responsibility has a Central recommendations lane followed by Suggested for you. Central selections and optional catalogue matches have separate counts and expansion controls. Empty central lanes explicitly say that no recommendation is published. Shared Foundation learning links back to its original section and does not hide additional level-specific selections.

The active plan supplies the source name and review labels, including for schema-2/3 imports. AI proposals published centrally remain marked as awaiting review. Unknown review status is explicit, and availability is separate: proposed internal sessions and catalogue resources awaiting validation can be saved but not committed. Ready learning uses the existing add-to-plan and completion flows.

The catalogue, model, Recommended Training Pathways v0.1 selections, recommendation ranking, progress calculations, storage keys, backup format and personal records are unchanged. The live standalone file and 1.6.0 distribution are rebuilt. See [release verification](../learning-path/qa/recommendation-lanes-1.6.0.json).

## Group CISO next-steps walkthrough — 2 November 2026

Added an eight-slide [unofficial walkthrough](../presentations/AI-Era_2027_Next-Steps_Group-CISO_Walkthrough.pptx), styled to match the capability briefing. Covers provisional component ownership, owner validation and recommendations, the proposed mandatory 2027 Foundation/L1 package (10h 41m), BISO/Domain use-case contributions, and the learning app/prompt-library offer for CISO Connect. No per-slide approval requests; formal approval is a later separate session. Ownership, launch dates and delivery arrangements remain provisional. Secure coding/red-team ownership boundaries need reconciliation before any framework changes. Existing model, catalogue, recommendations, apps and two earlier decks remain unchanged.

The walkthrough was subsequently expanded to nine slides with a provider-sourced summary of the selected CertMike SecAI+ course immediately after the baseline slide. Course selections, duration and model assessments remain unchanged.

## Catalogue v16 and current-app retirement refresh — 2 November 2026

After viewing the catalogue freshness review, the user instructed: “apply the retirements and ensure relevant current apps (not their historical old versions) are refreshed if needed”. All 18 reviewed retirements are applied. The workbook Retirements register owns lifecycle; Offers and Tool track default to Active. Original rows, 58,100 numerical assessments and 9,591 coverage formulas remain intact as historical evidence. Apps import 516 active resources and compact retirement metadata for saved history. All retained course objects, 140 outcomes, 23 scoring groups, unassessed rows and catalogue-wide outcome maxima are unchanged.

Planner 2.2.1 retains the blank component starter. Its current legacy L3 example removes TR-229 and advances plan revision 2 → 3; no replacement is assigned. Own-layer evidence drops to zero for N2.1, N2.2, N6.2, N6.5 and N10.4 before considering inheritance/internal teaching. Other selections, budgets and overrides are unchanged. Historical defaults and app distributions are preserved. Saved browser selections are not deleted: they display retirement warnings and no current assessed credit.

Recommended Training Pathways v0.2 preserves all v0.1 components, audience paths, selections, exclusions, brief details, time, coverage and review labels after compatibility review. None of the retired courses was selected or pinned. The scenario ID remains stable for saved learner scopes. V0.1 is archived unchanged; publication is not approval of the outstanding AI recommendations. Learner 1.6.1 embeds the new catalogue and publication while preserving personal progress, notes, feedback, storage keys and backup formats. Retired items remain readable in history.

Model 2 revision 3 is rebuilt only for the catalogue identity; its approved prose, outcomes and applicability are unchanged. All previous release ZIPs and archived evidence retain their bytes. The 13 retained courses flagged for content refresh remain an explicit follow-up, without new assessment credit. Implementation and checks: [v16 evidence](../catalogue/evidence/v16/README.md).
