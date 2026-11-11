# Training catalogue

[AI_Era_Cyber_Training_Catalogue.xlsx](AI_Era_Cyber_Training_Catalogue.xlsx) is the assessed catalogue: courses, the 140-outcome rubric, scores and evidence. It keeps one filename; previous versions are in Git (tags `catalogue-vN`, and `pre-simplification` for v7–v17 files). Assessment provenance is in [evidence/](evidence/README.md).

## Change the catalogue

1. Edit the workbook in Excel. Recalculate and save: the importer reads cached formula values.
2. From the project root (Node.js 20+, Python 3 with openpyxl; works on Windows, macOS and Linux):

```sh
node catalogue/scripts/rebuild.mjs catalogue/AI_Era_Cyber_Training_Catalogue.xlsx --check
node catalogue/scripts/rebuild.mjs catalogue/AI_Era_Cyber_Training_Catalogue.xlsx --preview
node catalogue/scripts/rebuild.mjs catalogue/AI_Era_Cyber_Training_Catalogue.xlsx --app-version 1.6.6 --planner-version 2.2.5
```

- `--check` validates the workbook and lists added, removed and changed courses. Nothing is written.
- `--preview` builds a throwaway learner app in `.work/catalogue-preview/`.
- With no mode flag it asks for confirmation, publishes `training-planner/public/data/catalogue.json`, regenerates the framework documents and component starter, rebuilds the pathways guide, planner and learner app, and runs all tests. `--yes` skips the question; `--skip-tests` skips tests.

3. Add a line to [the changelog](../docs/CHANGELOG.md), commit, and tag `catalogue-vN`.

If a recommended course was removed, the pathways build stops and names it. To undo, discard the changes with Git.

## Workbook layout

| Sheet | Role |
| --- | --- |
| Offers, Tool track | Course records (imported by named headers). Lifecycle defaults to Active. |
| Proposed training | Internal training briefs (planned teaching; never assessed credit). Keep the headers; delivery status is `Proposed`, `In development` or `Ready`. |
| Needs, Rubric | 23 needs and 140 outcomes. |
| Scoring guide | Rubric and glossary definitions. |
| Scores | One row per course/outcome: 0–3 or explicitly Unassessed. |
| Coverage | Excel coverage formulas, reconciled against the importer's calculation. |
| Build items | Six planner templates. |
| Retirements | Lifecycle authority for retired courses; retired rows stay for history. |
| V8 audit | Course assessment history shown in course details. |
| README | Workbook notes. |

Keep stable IDs, links and source rows, and keep zero distinct from unassessed. Tool-track descriptions never supply rubric scores.

The planner can also write a Proposed training sheet into a downloaded copy of the workbook (**Save internal training to Excel**); saving that copy here and rebuilding makes the briefs part of the catalogue.

## Individual steps

```sh
python3 training-planner/scripts/refresh_catalogue.py catalogue/AI_Era_Cyber_Training_Catalogue.xlsx --check
python3 training-planner/scripts/verify_workbook.py catalogue/AI_Era_Cyber_Training_Catalogue.xlsx
```

Do not rerun historical scripts in `evidence/` as the import workflow.
