# Training catalogue

[AI Era Cyber Training Catalogue v12](AI_Era_Cyber_Training_Catalogue_v12.xlsx) is the current assessed workbook, dated 31 October 2026. [Previous workbooks](../archive/catalogues/) are historical. [Review evidence](evidence/README.md) preserves assessment provenance.

The workbook owns courses, rubric assessments and evidence. The live JSON snapshot is [catalogue.json](../training-planner/public/data/catalogue.json); snapshot/version metadata and the source workbook hash are embedded there. The outdated Matrix sheet is not the curriculum authority.

The current import contains 528 resources, 140 active outcomes, 23 scored needs, 57,260 numerical scores and 280 explicitly unassessed rows. Preserve stable IDs, links, source rows and the distinction between zero and unassessed. Tool-track descriptions do not supply rubric assessment scores.

## Maintenance

From the project root, install `training-planner/requirements.txt` if the Python Excel reader is not available. Save and recalculate the workbook in Excel first; the importer reads cached formula results and does not calculate Excel formulas.

```sh
python3 training-planner/scripts/refresh_catalogue.py catalogue/AI_Era_Cyber_Training_Catalogue_v12.xlsx --check
python3 training-planner/scripts/verify_workbook.py catalogue/AI_Era_Cyber_Training_Catalogue_v12.xlsx
```

For an intentional new catalogue release, use a new workbook filename/version, document reassessments, then run the refresh without `--check`. The refresh archives snapshots in `training-planner/catalogue-history/`; it does not rewrite Excel or approve existing scenario selections. Review changes against the retained default pathway before updating its catalogue identity, and regenerate the model/crosswalk and component starter. Build and test both apps as described in [AGENTS.md](../AGENTS.md). Update current-document links and release identities when publishing a changed product.

Do not rerun historical assessment scripts as the ordinary import workflow. Their original paths, source dates and reviewed decisions are preserved for audit.
