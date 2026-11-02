# AI era training — project guidance

## Purpose and current scope

Enable the company's cybersecurity workforce for a time when most of the work will be performed by agents. Deliver a coherent capability framework, assessed training catalogue, recommended pathways, pathway builder, staff learning/feedback app and presentations.

Read [README.md](README.md) for the current deliverables, [project context](docs/PROJECT_CONTEXT.md) for agreed decisions, and [inventory](docs/INVENTORY.md) for the directory map and archive decisions.

On 1 November 2026 the user archived the outdated 2027 training plan and the no-longer-needed Foundation/L1 review. Both existing PowerPoint presentations remain live. An additional unofficial Group CISO next-steps walkthrough was added on 2 November 2026; formal approval remains a separate session.

## Deliverables and authority

| Deliverable | Entry point | Supporting source |
| --- | --- | --- |
| Training catalogue | [Current workbook](catalogue/AI_Era_Cyber_Training_Catalogue_v16.xlsx) | [Catalogue guide](catalogue/README.md); `catalogue/evidence/` |
| Capability framework | [Model](capability-framework/Agentic-Era_Workforce_Capability_Model.md) | [CSV crosswalk](capability-framework/Capability_Model_Crosswalk.csv); [framework guide](capability-framework/README.md) |
| Recommended training pathways | [Pathways v0.2](recommended-pathways/Recommended-Training-Pathways.md) | [Editable planner scenario](recommended-pathways/Recommended-Training-Pathways.json); [maintenance guide](recommended-pathways/README.md) |
| Suggested-pathway builder | [Standalone app](training-planner/Training-Planner.html) | [Guide](training-planner/README.md); `training-planner/public/`, `scripts/`, `tests/` |
| Staff learning and feedback | [Standalone app](learning-path/index.html) | [Guide](learning-path/README.md); `learning-path/src/`, `scripts/`, `tests/` |
| Presentations | [Model briefing](presentations/Agentic-Era_Workforce_Capability_Model_Briefing.pptx) and [capability needs](presentations/AI-era-cyber-capability-needs.pptx), plus [2027 next steps](presentations/AI-Era_2027_Next-Steps_Group-CISO_Walkthrough.pptx) | [Presentation guide](presentations/README.md); `presentations/source/` |

The model document is the authoritative description of the framework. The workbook owns course records, rubric assessments and evidence; its old Matrix sheet is not curriculum authority. Flag discrepancies between deliverables instead of silently choosing a different interpretation.

The recommended-pathways JSON owns recommended selections, audience composition and review decisions. Its guide, internal briefs and coverage record are generated together. Foundation/L1 is Reviewed: TR-281 + TR-145 + the saved one-hour AI use cases brief, counted once. Other recommendations are AI recommendation - to be reviewed. Exclude TR-229 Reasoning with o1. On 2 November the user approved 18 catalogue retirements and current-app refreshes: v16 imports 516 active resources, and the current legacy planner bundle removes TR-229 without a replacement. Preserve retired IDs, assessment rows and saved personal plans; never refresh historical app packages. The Retirements sheet owns lifecycle, with cached Lifecycle values on Offers and Tool track validated at import. Selection review does not make proposed internal training delivery-ready or assessed. Pathway version 0.2 is independent of app/catalogue/model identities.

The readable model and CSV/JSON crosswalks are generated from `training-planner/public/capability-model.js`, `model-explanation.js`, `presentation.js` and the imported catalogue. Preserve approved prose when changing these sources; do not overwrite manual model changes without reconciling them. Do not edit generated copies independently and leave the source inconsistent.

Current identities: catalogue **v16**, snapshot `9ed4551ae565417e`; model **2 revision 3**; planner **2.2.1**; learner app **1.6.1**. See `training-planner/public/release.js`, `learning-path/config.json`, and [project context](docs/PROJECT_CONTEXT.md) for release details. An app release, catalogue snapshot, model revision and scenario schema are separate identities.

## Directory rules

- `catalogue/`, `capability-framework/`, `recommended-pathways/`, `training-planner/`, `learning-path/` and `presentations/` contain the live deliverables.
- `analysis/` is reserved for new active analyses; no previous report is current by default.
- `docs/` holds current guidance, decisions and the migration inventory. `docs/history/` holds frozen handovers; historical statements do not override current decisions.
- `releases/` contains version-labelled distribution packages, not the editable source of truth.
- `archive/` holds frozen prior workbooks, models, analyses and packages. Preserve original bytes and manifests. Historical scripts may reference the former layout; use the recorded Git checkpoint for exact historical reconstruction rather than rewriting archived evidence.
- `catalogue/evidence/` and `presentations/source/` preserve research/build provenance. Their historical scripts are not current maintenance commands; use the live guides.
- `training-planner/catalogue-history/` and `scenario-history/` remain in place for compatibility and comparisons. `training-planner/qa/` holds screenshots and verification evidence.
- `.work/` is ignored scratch space. Dependencies, render output, intermediate workbooks and duplicate local copies belong there. Never put the only copy of a live deliverable or essential source in ignored storage.

Keep both app directory names and runnable HTML paths stable. Browser storage can depend on file location/origin. Preserve saved plans, backup formats and storage keys.

## Domain and application constraints

- The model is Foundation + agentic level + relevant role specialisms + tool training. Foundation is not a fourth level. L1 works with AI assistance; L2 supervises agents; L3 builds/evaluates agents, including no-code/low-code work. Levels are independent of seniority and the nine roles.
- Preserve stable course/outcome IDs, 140 active outcomes, 23 scoring groups, source references, evidence and explicit unassessed records. Do not merge scoring groups or infer assessment credit from tool descriptions.
- Curriculum coverage is not measured competence or operational authorisation. Catalogue evidence and planned internal teaching must remain distinguishable.
- Coverage uses each outcome's best course score (0–3), then equally weighted need percentages. Deduplicate shared outcomes, courses and internal learner time. Keep full-course duration rules and explicit unknowns.
- Do not reintroduce TR-127, which the user excluded from this corporate programme. Preserve other existing selection/exclusion decisions unless the planning task explicitly changes them.
- Planner schema 3 uses reusable components and starts blank. Learner 1.6.1 publishes Recommended Training Pathways v0.2 by user request and accepts schema-2/3 central plans. Native component variants and review labels are retained; derived compatibility groups support existing profiles. Coached routes require an explicit learner choice. Preserve personal learning and feedback when publishing.
- Learner For you retains the four overview/progress cards and scrolling layers. Each layer separates Central recommendations from optional Suggested for you matches. Always show the central lane, including empty and shared-Foundation states. Central publication, selection review, delivery readiness and personal progress remain distinct; imported plans supply their own names, selections and review labels.
- Planner changed-input review gates were removed by user request; do not restore them accidentally. The learner app's central-scope review behaviour is separate.
- Learner onboarding asks only level, broad responsibility areas, planned tools and optional Python/Git comfort. Detailed task/activity preferences and the starting-point assessment are optional after quick setup; never invent activity answers. Preserve saved refined responsibility choices.
- Learner progress and feedback are browser-local. Microsoft Forms is configurable but unconnected. Do not invent central receipt, automatic syncing or learner competence.

## Build and verify

Run from the repository root. Node.js 20+ supports the app builds; Python supports packaging and feedback import. The planner development dependency is installed with `npm ci --prefix training-planner`; workbook checks need `python3 -m pip install -r training-planner/requirements.txt`.

```sh
# Validate the saved/recalculated workbook without publishing a new snapshot.
python3 training-planner/scripts/refresh_catalogue.py catalogue/AI_Era_Cyber_Training_Catalogue_v16.xlsx --check

# Rebuild the current framework and app artifacts from their existing inputs.
node training-planner/scripts/build_capability_model.mjs
node training-planner/scripts/build_component_starter.mjs
python3 training-planner/scripts/build_standalone.py
node learning-path/scripts/build.mjs

# Rebuild/check the recommended pathway guide and coverage against its saved snapshot.
node recommended-pathways/scripts/build.mjs
node recommended-pathways/scripts/build.mjs --check

# Existing regression checks.
npm test --prefix training-planner
python3 -m unittest discover -s training-planner/tests -p 'test_*.py'
npm test --prefix learning-path
python3 -m unittest discover -s learning-path/tests -p 'test_*.py'
```

For workbook changes, read the [catalogue guide](catalogue/README.md) first. Refreshing catalogue data does not approve revised scenario selections. Packaging rejects inconsistent catalogue/model identities. Do not run `seed.mjs` or archived annual-plan `--publish` commands during routine rebuilds: they replace the retained default.

Run relevant tests for changed dependencies, inspect generated artifacts, and smoke-test affected browser flows. Do not regenerate frozen reports just to make them match the latest catalogue.

## Git and maintenance

Use the existing repository and preserve its history. Keep intentional changes in focused commits, use `codex/` for new branches, and checkpoint substantive existing work before a large reorganisation. Track source, current workbooks/presentations, required evidence and intentional releases; exclude scratch files, dependencies and local credentials.

Keep README pointers, this file, current context and release metadata consistent when promoting a new deliverable. Record status changes and source versions. The pre-reorganisation checkpoint is `182e18c`; [the inventory](docs/INVENTORY.md) records the migration.
