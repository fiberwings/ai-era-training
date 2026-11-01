# Cyber capability planner

Current release: **2.0.8 — 31 October 2026**. Catalogue **v12**, snapshot `6db669ed065cab54`; capability model **2 revision 3**.

Open [Training-Planner.html](Training-Planner.html) in a desktop browser. It embeds the full catalogue, model, application and solver, and works without installation or a server. [Project context](../docs/PROJECT_CONTEXT.md) records the agreed scope; [AGENTS.md](../AGENTS.md) identifies authoritative sources and working rules.

## Current starting points

The component workspace starts with **21 blank components and 19 audience templates**. Compose Foundation, L1 Entry, L2 Practitioner, L3 Expert, specialisms and tooling. Course budgets start at 2h, 2h, 8h and 24h for the shared layers, with 4h for each specialism; internal practice is additional. Tool budgets begin unset. Audience-specific copies let a local variant evolve without changing other audiences.

The legacy workspace retains existing schema-1/2 plans. Its bundled annual v3 selections and budgets remain unchanged by explicit user choice on 1 November 2026. The [old annual report](../archive/analysis/2027-training-plan/2027-Training-Plan-v3.html) is archived as outdated, not a current recommendation. Do not replace the bundled default during routine maintenance. The learner app still consumes this schema-2 default; it cannot yet publish schema-3 component plans.

Existing browser plans are never automatically cleared or converted. New schema-3 plans use `public/data/component-starter.json`; retained legacy defaults are in `public/data/default-scenario.json`.

## Planning workflow

1. Set up learning components and compose audience paths, or open/duplicate an existing legacy plan.
2. Review the level, responsibilities, conditional activities, tools and time budget. Scope follows the work, not seniority or department alone.
3. Explore the full catalogue and structured course details. Review learning commitment, access, contextual fit, limitations and assessed outcome evidence.
4. Use recommendations to preview combinations within budget. They optimise assessed coverage; applying a recommendation is an explicit action.
5. Review path coverage and remaining needs. Filters and search help identify missing must-haves and gaps the catalogue cannot close; CSV and print retain the complete scope.
6. Add internal learning with an owner, time estimate and linked outcomes. Planned coverage updates immediately; assessed catalogue coverage remains separate.
7. Export scenario JSON for backup/reloading and CSV/print for the decision record. Finalised plans are read-only; duplicate them to make a new draft.

A linked internal outcome represents planned full coverage, including proposed teaching. Delivery status is readiness, not assessment credit. Shared course and internal-item time is counted once. Missing assessments remain distinct from explicit zero scores. Course details show both current-scope and all-outcome evidence; historical audits are labelled separately.

Finalisation retains catalogue/model identity and unresolved-reference checks. Changed-input review flags no longer block planning or finalisation. Coverage gaps do not add a finalisation gate. A finalised plan locks decisions but does not automatically bind itself to a frozen catalogue; retain JSON plus CSV/print when an immutable record is needed.

## Framework and calculations

[The framework](../capability-framework/Agentic-Era_Workforce_Capability_Model.md) is Foundation + agentic level + relevant role specialisms + tool training. The [CSV](../capability-framework/Capability_Model_Crosswalk.csv) and [JSON](public/data/capability-crosswalk.json) crosswalks map 140 outcomes across the original 23 scoring groups. The complete explanation is also available in the app's Capability model view.

- Each outcome takes the best recorded course score, from 0 to 3. Need coverage is the sum divided by three times the applicable outcome count; overall coverage weights needs equally.
- Must-have outcomes at zero remain visible. Published teaching evidence is not measured competence, endorsement or operational permission. Tool metadata supplies no invented scores.
- HiGHS optimises assessed coverage under course-hour budgets with pinned courses included. Ties prefer fewer hours and then fewer courses; there is no resource-count limit. Recommendations are conditional on inherited/shared teaching, not one global optimum.
- Full-course durations apply; ranges use the upper bound. Unknown time remains unresolved. Overrides are explicit estimates. Selected/inherited courses and outcomes are deduplicated.
- Automatic eligibility considers applicability, prerequisites/audience rules, assessment evidence, availability, resource type and usable duration. Manual selections remain possible and expose warnings. Catalogue ceilings can include resources outside automatic-selection filters.

The solver has a 15-second solve budget and a 20-second worker watchdog. It reports optimality only when established, without inventing a MIP gap.

## Build the current release

From the project root, with Node.js 20+ and Python available:

```sh
node training-planner/scripts/build_component_starter.mjs
node training-planner/scripts/build_capability_model.mjs
python3 training-planner/scripts/build_standalone.py
node learning-path/scripts/build.mjs
```

The component starter and model generation use existing inputs; they do not replace `default-scenario.json`. **Do not run `seed.mjs` or archived annual-plan `--publish` commands during routine rebuilds.** Those commands can replace the retained default. Shared-module changes require rebuilding and testing both apps.

`build_standalone.py --output /path/to/Planner.html` selects another output. Packaging is deterministic, rejects mismatched catalogue/model identities and replaces the output atomically. If packaging fails, the previous standalone remains usable. The source workbook and saved browser plans are not rewritten.

The planner version/date live in `public/release.js`. Change them for a changed distributed product, separately from catalogue/model/scenario versions. Rebuilding identical inputs retains the same release identity. [Release packages](../releases/README.md) contain the current standalone; older Windows update kits are archived.

## Catalogue refresh

Read the [catalogue guide](../catalogue/README.md). Save and recalculate Excel first; Python reads cached formula results. Install the reader if needed:

```sh
python3 -m pip install -r training-planner/requirements.txt
python3 training-planner/scripts/refresh_catalogue.py catalogue/AI_Era_Cyber_Training_Catalogue_v12.xlsx --check
python3 training-planner/scripts/verify_workbook.py catalogue/AI_Era_Cyber_Training_Catalogue_v12.xlsx
```

For an intentional update, refresh without `--check`, review its change report and scenario compatibility, then rebuild current model/starter/app artifacts. Changing a snapshot does not approve old planning decisions. The packager requires compatible identities; never bypass that by blindly stamping a new version into a scenario.

Importing ignores the outdated Matrix, preserves IDs and evidence, validates source references and scores, and reconciles workbook coverage rows. `catalogue-history/` retains old/new snapshots and change reports. Repeating an unchanged refresh creates no new backup. A failed validation leaves the active snapshot intact. Rollback uses `refresh_catalogue.py --rollback VERSION_HASH` and affects the loaded catalogue for every plan, not an individual scenario.

## Development and verification

Install the planner's locked development dependency with `npm ci --prefix training-planner` when needed. The Python server and standalone packager use the standard library; Excel import requires `openpyxl`.

```sh
npm test --prefix training-planner
python3 -m unittest discover -s training-planner/tests -p 'test_*.py'
```

Source: `public/`; import/build tools: `scripts/`; regression checks: `tests/`; previous scenario fixtures: `scenario-history/`; browser evidence: [qa](qa/README.md). Keep the bundled solver and its licence together.

For optional server mode, from the project root:

```sh
python3 training-planner/server.py
```

Open http://127.0.0.1:4173. The full `public/` tree is required. Keep the same address, port, browser profile and standalone-file location when updating; browser storage depends on origin. Use JSON exports to transfer plans. Do not stop an unidentified process if the port is occupied.

The [previous guide](../docs/history/training-planner-README-2026-10-31.md) preserves historical release notes and implementation details. It contains superseded instructions and former paths; use this guide for current maintenance.
