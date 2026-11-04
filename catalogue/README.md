# Training catalogue

[AI Era Cyber Training Catalogue v17](AI_Era_Cyber_Training_Catalogue_v17.xlsx) is the current assessed workbook, released 2 November 2026 (assessment evidence remains dated 1 November). [Previous workbooks](../archive/catalogues/) are historical. [Review evidence](evidence/README.md) preserves assessment provenance.

The workbook owns courses, rubric assessments and evidence. The live JSON snapshot is [catalogue.json](../training-planner/public/data/catalogue.json); snapshot/version metadata and the source workbook hash are embedded there. The capability framework and Recommended Training Pathways own curriculum; obsolete Excel planning views are archived in v16.

The current import contains 516 active resources (403 Offers and 113 Tool track entries), 140 active outcomes, 23 scored needs, 56,140 numerical scores and 280 explicitly unassessed rows. Preserve stable IDs, links, source rows and the distinction between zero and unassessed. Tool-track descriptions do not supply rubric assessment scores.

V17 simplifies the workbook from **18 tabs to 12**, without changing any imported course, assessment, outcome, internal brief, build template or retirement record. The [unchanged v16 workbook](../archive/catalogues/AI_Era_Cyber_Training_Catalogue_v16.xlsx) preserves Matrix, empty Paths and Path detail, Tool adoption, Screening log, Codes and the historical release chronology. Necessary glossary definitions are retained in Scoring guide. See [v17 implementation and verification](evidence/v17/README.md).

Offers and Tool track come first, followed by Proposed training. Legacy Matrix-reference columns and duplicate Offers summaries are removed. Older descriptive fields and proposal IDs are hidden but retained. Tool track and Build items now import by header rather than column position. Keep the named headers and source rows.

The **Retirements** sheet remains the lifecycle authority for the 18 approved retirements. Offers and Tool track default to **Lifecycle = Active**; clear the filter to inspect retired rows. All 534 original resource records remain, and the importer validates all 9,591 coverage rows before excluding retirements. Retired metadata supplies names and reasons for saved-plan history, never assessment credit.

Needs, Rubric, Scores, Coverage, V8 audit and Retirements retain their original worksheet bytes and cached results. Coverage remains a required reconciliation sheet, Build items supplies six planner templates, and V8 audit remains visible in course assessment history. Detailed scoring evidence distinguishes zero from unassessed. Original source row numbers remain stable.

V15 adds the actual **AI use cases** internal training brief to a separate **Proposed training** worksheet, retaining its complete app details. The planner exposes it under **Full catalogue → Training type → Internal training** for reuse. The 534 existing resources and all assessments remain unchanged. See [v15 provenance](evidence/v15/README.md).

V14 adds five missing Udemy SecAI+ teaching courses (TR-281–TR-285), selected using at least 4.5/5 and 25 course ratings, then independently assessed against all 140 outcomes. Mana's course is excluded by explicit user quality decision; INT-1199 is already present and is not duplicated. See [v14 evidence](evidence/v14/README.md).

V13 reassesses ISC2 TR-014/TR-015, corrects exam-only TR-023 and adds official SecAI+ training as TR-280. The Pluralsight path TR-155 remains separately assessed. [Review evidence](evidence/v13/README.md) records all decisions, delivery limits and validation.

## Maintenance

### One-command rebuild (Windows, macOS, Linux)

After saving and recalculating the workbook in Excel, run [scripts/rebuild.mjs](scripts/rebuild.mjs) from the project root. It needs Node.js 20+ and Python 3 with openpyxl. On Windows it finds Python through the `py` launcher or `python`, and it works in PowerShell or Command Prompt.

```sh
node catalogue/scripts/rebuild.mjs catalogue/AI_Era_Cyber_Training_Catalogue_v18.xlsx --check
node catalogue/scripts/rebuild.mjs catalogue/AI_Era_Cyber_Training_Catalogue_v18.xlsx --preview
node catalogue/scripts/rebuild.mjs catalogue/AI_Era_Cyber_Training_Catalogue_v18.xlsx --app-version 1.6.4 --planner-version 2.2.3
```

- `--check` validates the workbook and prints the course change counts. Nothing is written.
- `--preview` builds a throwaway learner app in `.work/catalogue-preview/` against the edited workbook. The live catalogue, pathways and apps are untouched.
- Without either flag, it shows the snapshot change and asks for confirmation before writing anything (`--yes` skips the question). It then publishes the snapshot and regenerates the model, crosswalk and component starter. It also points the recommended pathways and the planner's retained 2027 default at the new snapshot, sets any requested app versions, and rebuilds the planner, pathways guide and learner app. Finally it runs all regression tests and lists what is still to do. `--skip-tests` omits the tests.

Pointing the pathways at a new snapshot republishes the existing recommendations against it, so it does not approve them. If a selected course was removed, the pathways build stops with its ID. If any step fails, discard the changes with Git or rerun the script with the previous workbook. Release-record tests check frozen snapshots in `training-planner/catalogue-history/`, not the live catalogue, so ordinary course edits do not fail them. The planner's "source snapshot completeness" test still expects 516 resources and 56,140 scores in the live catalogue. Update those counts deliberately when you add courses or scores.

### Individual steps

From the project root, install `training-planner/requirements.txt` if the Python Excel reader is not available. Save and recalculate the workbook in Excel first; the importer reads cached formula results and does not calculate Excel formulas.

```sh
python3 training-planner/scripts/refresh_catalogue.py catalogue/AI_Era_Cyber_Training_Catalogue_v17.xlsx --check
python3 training-planner/scripts/verify_workbook.py catalogue/AI_Era_Cyber_Training_Catalogue_v17.xlsx
```

For an intentional new catalogue release, use a new workbook filename/version, document reassessments, then run the refresh without `--check`. The refresh archives snapshots in `training-planner/catalogue-history/`; it does not rewrite Excel or approve existing scenario selections. Review changes against the retained default pathway before updating its catalogue identity, and regenerate the model/crosswalk and component starter. Build and test both apps as described in [AGENTS.md](../AGENTS.md). Update current-document links and release identities when publishing a changed product.

Do not rerun historical assessment scripts as the ordinary import workflow. Their original paths, source dates and reviewed decisions are preserved for audit.

## Proposed internal training

Planner 2.1.0 and later can add a **Proposed training** tab to a downloaded copy of this workbook. This is a persistent register of internal training briefs and their component/scenario assignments, separate from assessed Offers/Tool track courses, Scores and the original Build items. All app brief details are retained, including unknown hours, development status, notes and linked outcome IDs. Export all current-scenario components with **Save internal training to Excel**, then retain the downloaded workbook. Re-exporting updates matching assignments; it does not delete other workbook proposals.

The tab's original IDs support repeat exports and reuse. Keep the column headers, treat IDs as text, use numeric hours (blank means unknown), and use `Proposed`, `In development` or `Ready` in the Delivery status column. The optional tab is read by the catalogue importer into `proposedTraining`, without turning proposals into assessed resources or inventing scores. The current workbook already contains the AI use cases brief, and the rebuilt planner lists it under **Full catalogue → Training type → Internal training**. The app can also reload a workbook directly with **Add from Excel**. New or revised briefs become part of the maintained catalogue through the normal refresh/rebuild workflow. Adding a tab changes workbook bytes, so formally publishing that workbook still requires the normal catalogue identity/release process above.
