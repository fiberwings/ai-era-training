# Training catalogue

[AI Era Cyber Training Catalogue v15](AI_Era_Cyber_Training_Catalogue_v15.xlsx) is the current assessed workbook, dated 1 November 2026. [Previous workbooks](../archive/catalogues/) are historical. [Review evidence](evidence/README.md) preserves assessment provenance.

The workbook owns courses, rubric assessments and evidence. The live JSON snapshot is [catalogue.json](../training-planner/public/data/catalogue.json); snapshot/version metadata and the source workbook hash are embedded there. The outdated Matrix sheet is not the curriculum authority.

The current import contains 534 resources, 140 active outcomes, 23 scored needs, 58,100 numerical scores and 280 explicitly unassessed rows. Preserve stable IDs, links, source rows and the distinction between zero and unassessed. Tool-track descriptions do not supply rubric assessment scores.

V15 adds the actual **AI use cases** internal training brief to a separate **Proposed training** worksheet, retaining its complete app details. The planner exposes it under **Full catalogue → Training type → Internal training** for reuse. The 534 existing resources and all assessments remain unchanged. See [v15 provenance](evidence/v15/README.md).

V14 adds five missing Udemy SecAI+ teaching courses (TR-281–TR-285), selected using at least 4.5/5 and 25 course ratings, then independently assessed against all 140 outcomes. Mana's course is excluded by explicit user quality decision; INT-1199 is already present and is not duplicated. See [v14 evidence](evidence/v14/README.md).

V13 reassesses ISC2 TR-014/TR-015, corrects exam-only TR-023 and adds official SecAI+ training as TR-280. The Pluralsight path TR-155 remains separately assessed. [Review evidence](evidence/v13/README.md) records all decisions, delivery limits and validation.

## Maintenance

From the project root, install `training-planner/requirements.txt` if the Python Excel reader is not available. Save and recalculate the workbook in Excel first; the importer reads cached formula results and does not calculate Excel formulas.

```sh
python3 training-planner/scripts/refresh_catalogue.py catalogue/AI_Era_Cyber_Training_Catalogue_v15.xlsx --check
python3 training-planner/scripts/verify_workbook.py catalogue/AI_Era_Cyber_Training_Catalogue_v15.xlsx
```

For an intentional new catalogue release, use a new workbook filename/version, document reassessments, then run the refresh without `--check`. The refresh archives snapshots in `training-planner/catalogue-history/`; it does not rewrite Excel or approve existing scenario selections. Review changes against the retained default pathway before updating its catalogue identity, and regenerate the model/crosswalk and component starter. Build and test both apps as described in [AGENTS.md](../AGENTS.md). Update current-document links and release identities when publishing a changed product.

Do not rerun historical assessment scripts as the ordinary import workflow. Their original paths, source dates and reviewed decisions are preserved for audit.

## Proposed internal training

Planner 2.1.0 and later can add a **Proposed training** tab to a downloaded copy of this workbook. This is a persistent register of internal training briefs and their component/scenario assignments, separate from assessed Offers/Tool track courses, Scores and the original Build items. All app brief details are retained, including unknown hours, development status, notes and linked outcome IDs. Export all current-scenario components with **Save internal training to Excel**, then retain the downloaded workbook. Re-exporting updates matching assignments; it does not delete other workbook proposals.

The tab's original IDs support repeat exports and reuse. Keep the column headers, treat IDs as text, use numeric hours (blank means unknown), and use `Proposed`, `In development` or `Ready` in the Delivery status column. The optional tab is read by the catalogue importer into `proposedTraining`, without turning proposals into assessed resources or inventing scores. The current workbook already contains the AI use cases brief, and the rebuilt planner lists it under **Full catalogue → Training type → Internal training**. The app can also reload a workbook directly with **Add from Excel**. New or revised briefs become part of the maintained catalogue through the normal refresh/rebuild workflow. Adding a tab changes workbook bytes, so formally publishing that workbook still requires the normal catalogue identity/release process above.
