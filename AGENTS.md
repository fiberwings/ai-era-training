# AI era training — working rules

Prepare the company's cybersecurity workforce for agentic AI: a capability framework, an assessed training catalogue, recommended pathways, a staff learning app and presentations. Start with [README.md](README.md). Current decisions are in [docs/DECISIONS.md](docs/DECISIONS.md); release history is in [docs/CHANGELOG.md](docs/CHANGELOG.md).

## Sources of truth

| What | Source (edit this) | Generated from it (never edit by hand) |
| --- | --- | --- |
| Courses, outcomes, needs, scores | `catalogue/AI_Era_Cyber_Training_Catalogue.xlsx` | `training-planner/public/data/catalogue.json` |
| Framework structure (levels, roles, specialisms, applicability) | `training-planner/public/capability-model.js`, `model-explanation.js`, `presentation.js` | `capability-framework/*.md`, `*.csv`, `*.docx`, `public/data/capability-crosswalk.json` |
| Central recommendations and review decisions | `recommended-pathways/Recommended-Training-Pathways.json` | `recommended-pathways/*.md`, `coverage.json` |
| Learner app | `learning-path/src/`, `learning-path/config.json` | `learning-path/index.html` |
| Planner | `training-planner/public/` | `training-planner/Training-Planner.html` |

The model document is generated, but contains approved prose: change the prose in the generator source, and reconcile manual edits before rebuilding. Flag discrepancies between deliverables instead of silently choosing one interpretation.

## Changing the catalogue

1. Edit the workbook in Excel, recalculate and save (the importer reads cached formula values).
2. `node catalogue/scripts/rebuild.mjs catalogue/AI_Era_Cyber_Training_Catalogue.xlsx --check` (validate), `--preview` (throwaway learner app), then without flags to publish and rebuild everything. Add `--app-version X.Y.Z` / `--planner-version X.Y.Z` when shipping.
3. Add one line to `docs/CHANGELOG.md`, commit, and tag `catalogue-vN`.

The workbook keeps one filename; Git holds previous versions. The pathways and learner builds always use the live catalogue; a removed selected course stops the build with its ID. Refreshing catalogue data does not approve recommendation changes.

## Domain rules

- The model is Foundation + agentic level + relevant role specialisms + tool training. Foundation is not a level. L1 works with AI assistance, L2 supervises agents, L3 builds/evaluates agents (including no-code/low-code). Levels are independent of seniority and the nine roles.
- Keep course and outcome IDs stable. Do not merge scoring groups. Keep zero distinct from unassessed. Never infer assessment credit from tool descriptions, internal training or delivery status.
- Coverage uses each outcome's best course score (0–3), then equally weighted need percentages. Deduplicate shared outcomes, courses and learner time. Keep full-course durations and explicit unknown durations.
- Curriculum coverage is not competence or operational authorisation. Assessed catalogue evidence and planned internal teaching stay distinguishable.
- Do not reintroduce TR-127 or TR-229. Preserve other selection/exclusion decisions unless the task explicitly changes them.
- Selection review status, delivery readiness and personal progress are separate. "AI recommendation - to be reviewed" stays visible until the user reviews it.

## App constraints

- Keep both app directory names and HTML paths stable: browser storage depends on file location. Preserve storage keys, backup formats and saved personal plans; never clear or convert them silently.
- Learner onboarding asks only level, broad responsibility areas, planned tools and optional Python/Git comfort. Never invent activity answers.
- Learner For you keeps the four overview cards and scrolling layers; each layer shows Central recommendations (always, including empty states) then optional Suggested for you.
- Feedback is browser-local and learner-submitted to the configured Microsoft Forms form. Do not claim central receipt, syncing or measured competence.
- Planner changed-input review gates were removed by user request; do not restore them. Do not run `training-planner/scripts/seed.mjs`: it replaces the retained legacy default.

## Build and test

Node.js 20+ and Python 3 with `openpyxl` (`python3 -m pip install -r training-planner/requirements.txt`); `npm ci --prefix training-planner` for the planner solver.

```sh
npm test --prefix training-planner
python3 -m unittest discover -s training-planner/tests -p 'test_*.py'
npm test --prefix learning-path
python3 -m unittest discover -s learning-path/tests -p 'test_*.py'
node recommended-pathways/scripts/build.mjs --check
```

Tests check behaviour and invariants, not the contents of past releases; do not add tests that pin course counts or old snapshots. Browser tests (`*.browser.cjs`) need Playwright and are optional.

## Repository

- Live deliverables: `catalogue/`, `capability-framework/`, `recommended-pathways/`, `training-planner/`, `learning-path/`, `presentations/`. `analysis/` holds active research; `catalogue/evidence/` and `presentations/source/` hold provenance (their scripts are historical, not maintenance commands).
- History lives in Git, not in folders. Tag `pre-simplification` holds the former archive, release ZIPs, snapshot history and handovers.
- `.work/` is ignored scratch space; never keep the only copy of anything there.
- Use `codex/` branches and focused commits.
