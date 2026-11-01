# Archive

Archived on 1 November 2026. These materials are retained for reference and are not current deliverables.

| Location | Status |
| --- | --- |
| [2027 training plan](analysis/2027-training-plan/2027-Training-Plan-v3.html) | Outdated; user chose to start fresh. Includes scenarios, reports, CSVs, build sources, packs, manifests and earlier versions. |
| [Foundation/L1 review](analysis/foundation-review/Foundation-training-review-2026-10-31.html) | No longer needed; includes evidence and earlier drafts. |
| [catalogues](catalogues/) | Original v7–v14 workbooks and v9 archive record. Current v15 is in [catalogue](../catalogue/README.md). |
| [capability-framework](capability-framework/) | Previous model documents. |
| [planner 2.0.6 packages](releases/planner-2.0.6/) | Older standalone ZIP and Windows update kit; embedded version verified before archiving. |
| [catalogue-v8 package](releases/catalogue-v8/) | Earlier distribution formerly in `delivery/`. |

The archived reports and existing historical manifests have not been rewritten. Relative commands and embedded paths in old scripts describe the original layout and original data versions. For exact reconstruction, use Git checkpoint **`182e18c`** in a separate checkout; do not run old `--publish` workflows against current data. The [migration inventory](../docs/inventory-2026-11-01.json) maps old locations to new ones.

The learner app and planner's legacy workspace still use their existing bundled selections because the user explicitly requested that they remain for now. The active test suite references an archived scenario to verify that those retained defaults did not change. This dependency does not make the old annual report a current recommendation.
