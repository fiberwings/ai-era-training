# Project context

Current as of 1 November 2026. This is the current handover; the [31 October handover](history/PROJECT_CONTEXT-2026-10-31.md) remains unchanged as historical evidence.

## Purpose

Prepare the company's cybersecurity workforce for an agentic AI operating model through a capability framework, evidence-based course catalogue, adaptable organisational pathways, individual learning plans and explanatory presentations. Functional heads need practical options within time budgets, clear evidence and visibility of gaps that require internal development.

The five live deliverables and their entry points are in the [root README](../README.md). [AGENTS.md](../AGENTS.md) supplies working rules, source relationships and build/test commands.

## Decisions on 1 November 2026

1. Adopt the deliverable-based directory structure in [the inventory](INVENTORY.md), using the existing Git repository.
2. Archive the 2027 training plan as outdated. Future annual planning is new work; the old report is not a current recommendation.
3. Archive the Foundation/L1 review as no longer needed.
4. Keep both the model briefing and the additional capability-needs deck as live presentation deliverables.
5. Keep the existing app defaults for now. This explicit decision preserves the learner's bundled annual selections and the planner's legacy starter while the component workspace continues to start blank. It does not reactivate the archived report.
6. Preserve existing personal/browser plans, catalogue evidence and historical snapshots. The reorganisation changes locations and guidance, not curriculum content or application behaviour.

## Current versions and authority

| Item | Current identity | Authority |
| --- | --- | --- |
| Catalogue | v12; 31 October 2026; `6db669ed065cab54` | [Workbook](../catalogue/AI_Era_Cyber_Training_Catalogue_v12.xlsx) |
| Framework | Version 2, revision 3 | [Model](../capability-framework/Agentic-Era_Workforce_Capability_Model.md) |
| Builder | 2.0.8; 31 October 2026 | `training-planner/public/release.js` and source |
| Staff app | 1.3.1; 31 October 2026 | `learning-path/config.json` and source |
| Bundled legacy pathway | 2027 v3, revision 2; Draft | `training-planner/public/data/default-scenario.json`, retained by explicit choice |
| Component starter | Schema 3; blank curriculum | `training-planner/public/data/component-starter.json` |

The catalogue has 528 resources: 411 Offers and 117 Tool track entries; 140 active outcomes across 23 scoring groups; 57,260 numerical scores and 280 explicitly unassessed rows. Workbook SHA-256: `6abef4de79f652a227984bdb67624cebd81ff96a656d33d8414c099ff49ef87c`.

The model document defines the agreed framework. The workbook supplies assessments and evidence. The generated app catalogue is a faithful imported snapshot. The model generator combines those outcomes with the versioned applicability and explanatory modules; its output includes the model document and CSV/JSON crosswalks. Source changes must preserve consistency with the agreed model.

Catalogue v12 reassessed TR-089 and TR-145 on 31 October; it did not refresh the old static analyses. Unchanged assessments retain their dates. Retired N5.2 remains historical and maps to revised N5.1; N5.8 is the separate cyber-risk overview.

## How the deliverables connect

The saved, recalculated Excel workbook is validated/imported into `training-planner/public/data/catalogue.json`. Planner model modules supply role, level, tool and outcome applicability. The model/crosswalk builder creates the human-readable framework and mapping files. The planner packager embeds current data, both starter formats, application code and the solver into `Training-Planner.html`.

The learner build reads that same catalogue, shared model/scoring modules and the retained schema-2 default pathway, then writes its standalone `index.html`. It keeps personal selections, progress and feedback separate from the central recommendation. The learner app cannot yet consume schema-3 component plans.

The presentations are editable PowerPoint deliverables. Their historical authoring chain is retained in [presentations/source](../presentations/source/README.md). The model briefing's catalogue appendix was built from v10; review that dated content before presenting it as aligned with v12. No deck content was refreshed during this reorganisation.

## Product decisions to preserve

- Foundation + agentic level + role specialisms + tool training are independent dimensions. Foundation is common knowledge; levels describe work with agents, not seniority. There are nine model roles with responsibility packages.
- Training coverage measures published curriculum evidence, not learner competence, course quality or operational authorisation. Tool metadata and internal delivery status do not create assessment evidence.
- The planner supports blank component curricula, shared teaching, audience-specific variants, detailed course/outcome evidence, manual internal teaching, time budgets, CSV/print and JSON backup.
- Internal linked outcomes contribute to planned coverage; assessed catalogue coverage remains distinct. Recommendations optimise assessed coverage. Preserve deduplication and full-course time estimates.
- Existing schema-1/2 plans retain their interpretation in the legacy workspace. Saved browser plans are never automatically cleared or converted.
- The staff app provides Foundation, one level, chosen roles/responsibilities and tools, plus search, commitments, progress and feedback. Target work and suggested starting point remain separate.
- Microsoft Forms has no configured destination. Feedback is locally saved/exportable; central collection requires connecting a real form. Submission confirmation is self-reported. There are no user accounts, automatic enrolments or background synchronisation.

## Historical material and future work

[Archive index](../archive/README.md) lists the frozen reports, workbooks, model versions and older distributions. Historical handovers and scripts can contain obsolete paths or decisions; they are provenance, not current operating instructions. The Git checkpoint `182e18c` preserves the pre-move layout.

The active `analysis/` folder is ready for future work. Replacing the retained app defaults, supporting schema 3 in the learner publisher, connecting Forms, and updating dated presentation content are separate future tasks. None was silently performed during reorganisation.
