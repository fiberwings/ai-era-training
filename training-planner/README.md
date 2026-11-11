# Cyber capability planner

Current versions are in the [changelog](../docs/CHANGELOG.md). The planner will not be delivered in its current form; it remains the editor for component scenarios and hosts the shared framework modules used by the learner app.

Open [Training-Planner.html](Training-Planner.html) in a desktop browser. It embeds the full catalogue, model, application and solver, and works without installation or a server. [Decisions](../docs/DECISIONS.md) record the agreed scope; [AGENTS.md](../AGENTS.md) identifies authoritative sources and working rules.

## Current starting points

The maintained [Recommended Training Pathways v0.3](../recommended-pathways/README.md) is available as a separate [schema-3 JSON import](../recommended-pathways/Recommended-Training-Pathways.json). Foundation/L1 and the separately approved core-reference placements are Reviewed; wider pathways remain AI recommendation - to be reviewed. Use **Scenario & exports → Import scenario JSON** to load it. The workspace continues to start blank.

The component workspace starts with **21 blank components and 19 audience templates**. Compose Foundation, L1 Entry, L2 Practitioner, L3 Expert, specialisms and tooling. Course budgets start at 2h, 2h, 8h and 24h for the shared layers, with 4h for each specialism; internal practice is additional. Tool budgets begin unset. Audience-specific copies let a local variant evolve without changing other audiences.

The legacy workspace retains existing schema-1/2 plans. On 2 November 2026 the user authorised the catalogue retirements: the current bundled annual v3 example removes TR-229 from L3, without a replacement, and advances to revision 3. Other selections, budgets and overrides remain unchanged. The old annual report is archived as outdated (Git tag `pre-simplification`). Do not replace the bundled default during routine maintenance. By subsequent user request, learner 1.5.0 publishes the separate Recommended Training Pathways v0.1 schema-3 source. Saved browser plans are retained: retired selections display their name, retirement reason and a warning, with no current assessed credit. Current catalogue discovery and suggestions contain 516 active resources.

Existing browser plans are never automatically cleared or converted. New schema-3 plans use `public/data/component-starter.json`; retained legacy defaults are in `public/data/default-scenario.json`.

## Build specialism and tool pathways

In **Learning components**, use the section links to jump to **Specialisms** or **Tool pathways**.

- **Specialisms:** filter by any of the nine roles and open **Review pathway →** on a responsibility card. Set the course budget, recommend a combination, preview/apply selections, adjust outcome scope and add internal practice as with Foundation/L1/L2/L3. Shared responsibility packages are planned once. Use **Create audience-specific copy** for an existing audience's local variant.
- **Tools:** select **+ Create tool pathway**, enter an approved product, choose intended tasks and optionally set a course budget. The name defaults to the product. **Find training for this tool** shows resources matching both product and recorded task metadata. Preview each resource before adding; budget fit uses full-course hours and keeps unknown time explicit. Switch **Tool fit** to **All catalogue resources** for broader manual review. Add internal practice even when no framework outcome applies.
- **Compose:** in **Audience paths → Edit profile**, choose relevant responsibilities and tool pathways. Shared teaching, resources and learner time continue to count once. Scenario JSON exports preserve these pathways and their audience assignments.

Tool matching does not optimise or award assessed coverage. Catalogue scores remain the evidence for assessed outcomes; internal briefs remain planned teaching.

## Planning workflow

1. Set up learning components and compose audience paths, or open/duplicate an existing legacy plan.
2. Review the level, responsibilities, conditional activities, tools and time budget. Scope follows the work, not seniority or department alone.
3. Explore the full catalogue and structured course details. Review learning commitment, access, contextual fit, limitations and assessed outcome evidence.
4. Use recommendations to preview combinations within budget. They optimise assessed coverage; applying a recommendation is an explicit action.
5. Review path coverage and remaining needs. Filters and search help identify missing must-haves and gaps the catalogue cannot close; CSV and print retain the complete scope.
6. Add internal learning with an owner, time estimate and linked outcomes. Planned coverage updates immediately; assessed catalogue coverage remains separate.
7. Export scenario JSON for backup/reloading and CSV/print for the decision record. Finalised plans are read-only; duplicate them to make a new draft.

Each component lists its own internal learning. Prerequisite internal items appear under **Inherited learning**, labelled by their source component, like catalogue courses. Add/edit actions in the component editor use that component; a brief started in the catalogue uses its explicit destination.

A linked internal outcome represents planned full coverage, including proposed teaching. Delivery status is readiness, not assessment credit. Shared course and internal-item time is counted once. Missing assessments remain distinct from explicit zero scores. Course details show both current-scope and all-outcome evidence; historical audits are labelled separately.

Finalisation retains catalogue/model identity and unresolved-reference checks. Changed-input review flags no longer block planning or finalisation. Coverage gaps do not add a finalisation gate. A finalised plan locks decisions but does not automatically bind itself to a frozen catalogue; retain JSON plus CSV/print when an immutable record is needed.

## Save proposed internal training in Excel

The maintained v18 workbook already contains **AI use cases**. In the planner, open **Full catalogue**, set **Training type** to **Internal training**, and preview the saved brief to choose its destination component. All details are retained when adding it to another plan.


Use **Scenario & exports → Save internal training to Excel** (also **Save to Excel** in the Internal learning section). Choose the current catalogue `.xlsx`, then download the updated copy. Save that copy as your working catalogue. The app does not overwrite a file on your computer automatically.

The **Proposed training** tab is separate from Offers, Tool track, Scores and the existing Build items. It retains every internal item in the current scenario, at all delivery statuses: title, owner, numeric learner hours or a blank for unknown time, delivery status, teaching/practice notes, linked outcome IDs and descriptions, component/category/level, specialism/tool/task context and original item/component/scenario IDs. Export includes all components rather than only the path currently open. Repeated exports update the same assignments and retain records from other components and scenarios. Removing an item from a browser plan does not delete a saved workbook record; remove that row in Excel when it is no longer needed. Keep the original column headers and use the provided status values.

Use **Add from Excel** in a component's Internal learning section to load the workbook, preview a saved item and choose its destination component. **Add or update in component** preserves the original item ID and updates its details if it is already assigned there. It never assigns every workbook item to every component. Unknown outcome IDs must be corrected before importing. Product-specific items can have no linked outcomes when added to a tooling component. Imported proposals contribute only to planned internal teaching, never assessed catalogue coverage.

Catalogue maintenance also imports this optional tab into a separate proposed-training section of the snapshot. After an intentional catalogue refresh and rebuild, **Browse saved catalogue proposals** makes those records available without selecting the Excel file again. It does not select them in new blank plans automatically. Existing catalogue identity checks and the normal release workflow still apply to a changed workbook. No refresh or replacement of the retained starters is needed simply to export or reload a workbook in the app.

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

The component starter and model generation use existing inputs; they do not replace `default-scenario.json`. **Do not run `seed.mjs` during routine rebuilds.** Those commands can replace the retained default. Shared-module changes require rebuilding and testing both apps.

`build_standalone.py --output /path/to/Planner.html` selects another output. Packaging is deterministic, rejects mismatched catalogue/model identities and replaces the output atomically. If packaging fails, the previous standalone remains usable. The source workbook and saved browser plans are not rewritten.

The planner version/date live in `public/release.js`. Change them for a changed distributed product, separately from catalogue/model/scenario versions. Rebuilding identical inputs retains the same release identity.

## Catalogue refresh

Read the [catalogue guide](../catalogue/README.md). Save and recalculate Excel first; Python reads cached formula results. Install the reader if needed:

```sh
python3 -m pip install -r training-planner/requirements.txt
python3 training-planner/scripts/refresh_catalogue.py catalogue/AI_Era_Cyber_Training_Catalogue.xlsx --check
python3 training-planner/scripts/verify_workbook.py catalogue/AI_Era_Cyber_Training_Catalogue.xlsx
```

For an intentional update, refresh without `--check`, review its change report and scenario compatibility, then rebuild current model/starter/app artifacts. Changing a snapshot does not approve old planning decisions. The packager requires compatible identities; never bypass that by blindly stamping a new version into a scenario.

Importing uses named headers, preserves IDs and evidence, validates source references and scores, and reconciles workbook coverage rows. The six Build items templates and saved Proposed training register remain separate. A failed validation leaves the active snapshot intact. Previous snapshots are in Git; to roll back, restore the previous workbook and catalogue.json from Git.

## Development and verification

Install the planner's locked development dependency with `npm ci --prefix training-planner` when needed. The Python server and standalone packager use the standard library; Excel import requires `openpyxl`.

```sh
npm test --prefix training-planner
python3 -m unittest discover -s training-planner/tests -p 'test_*.py'
```

Optional browser regression checks use Playwright (installed separately): `node --test training-planner/tests/component-ui.browser.cjs`. They exercise the standalone HTML, so rebuild it first. The Excel round-trip test also needs Python with `openpyxl`; set `PLANNER_TEST_PYTHON` to that Python executable if needed.

Source: `public/`; import/build tools: `scripts/`; regression checks: `tests/`; legacy scenario fixtures: `tests/fixtures/`. Keep the bundled solver and its licence together. Excel ZIP handling uses the pinned JSZip 3.10.1 browser build in `workbook-zip.js`, with its MIT/pako licence embedded and retained in `public/vendor/JSZIP-LICENSE`.

For optional server mode, from the project root:

```sh
python3 training-planner/server.py
```

Open http://127.0.0.1:4173. The full `public/` tree is required. Keep the same address, port, browser profile and standalone-file location when updating; browser storage depends on origin. Use JSON exports to transfer plans. Do not stop an unidentified process if the port is occupied.
