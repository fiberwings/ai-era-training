# Catalogue v13: ISC2 and SecAI+ review

Review date: 1 November 2026. Source: catalogue v12, snapshot `6db669ed065cab54`, and the [full public-syllabus research](../../../analysis/secai-isc2-framework-review/README.md).

## Decisions

- TR-014: reassess all 140 outcomes using the bundle and six included-course pages. Correct the obsolete claim that only one-line descriptions exist.
- TR-015: reassess all 140 outcomes using its own page, including the published learning outcomes and case-study format. Keep it distinct from the larger bundle; do not inherit the other five courses' teaching.
- TR-023: remove the stray N5.8 score of 1. This is an exam-only record and supplies no taught coverage. Preserve the rest of its existing zero scores and historical evidence.
- TR-280: add official CertMaster Perform for SecAI+ as a distinct training record. Its assessment uses the official product and objective alignment, corroborated by detailed authorized-course outlines. Exact self-paced lab equivalence remains unverified; no practical outcome receives full credit. The 30–60-hour duration is retained and the planner uses its upper bound.
- TR-155: preserve the separately assessed Pluralsight path. No transfer of another provider's scores.

Existing review/selection decisions, the 140-outcome rubric, 23 need groups, original formulas, native workbook features and all unrelated resources are preserved. The two explicitly unassessed resources remain unassessed. TR-127 is not reintroduced. No affected course is selected in the retained default pathway. Its course selections, hours and budgets remain unchanged; the catalogue identity is refreshed after compatibility verification.

## Evidence and reproduction

`sources.json` records the reviewed URLs and boundaries. `assessment.json` holds outcome decisions and previous scores. `edits.json` is the exact typed-cell change set. `update.py` prepares the changes and assembles Artifact Tool-authored values into the original workbook package while preserving unrelated parts. `calc_inputs.py` prepares a compact dependency model, with untouched catalogue aggregates as controls. `author.mjs` authors the values, renders the affected views and recalculates that model. `verify.py` checks the saved workbook against the source, independently reconciles every Coverage row and verifies that unrelated resources remain identical.

Use the bundled Python/Node runtimes and the spreadsheet skill's setup/operation marker. Run from the repository root. Authoring intermediates and renders belong in `.work/catalogue/v13/`; copy `author.mjs` there for its runtime dependency link. Sequence: `update.py prepare`, `author.mjs before`, `author.mjs edit`, `update.py apply`, `calc_inputs.py`, `author.mjs calculate`, `update.py cache`, `author.mjs after`, `verify.py`. The baseline remains in `training-planner/catalogue-history/6db669ed065cab54.json` and the archived v12 workbook.

The final verification and recalculation records state the engine used and its limits. Native Excel is not installed on this host; the original Excel formulas are retained, and saved results are independently checked by the catalogue importer. This is not a claim of a native Excel save/reopen test.

The v13 catalogue is promoted through the normal refresh/build workflow. Planner 2.1.1 and learner 1.3.2 embed it, while the framework remains version 2 revision 3. Previous release packages and research outputs remain unchanged.

[Release verification](release-verification.json) records 157 passing regression checks, browser checks of the revised course details, unchanged retained choices/model prose and verified standalone packages. `promote.py` records the one-time metadata/archive promotion; `finalise.py` checks retained choices and packages the tested release. The historical Anthropic preservation test now uses its frozen v12 comparison; its current-course score checks still use the active catalogue.
