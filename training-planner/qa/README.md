# Planner verification evidence

## Catalogue v14 — planner 2.1.2 and learner 1.3.3

Verified 1 November 2026. [Release evidence](../../catalogue/evidence/v14/release-verification.json) records 159 passing regressions: 74 planner JavaScript, 17 planner Python, 65 learner JavaScript and three learner Python. Temporary loopback permission was used for the server-security test. All 9,591 workbook Coverage results reconcile; 529 existing resources and all original formulas/styles remain unchanged. Artifact Tool recalculation and an input-change/core-gap probe passed; native Excel was unavailable.

Both browser searches return nine SecAI+ resources, including all five additions, the unduplicated Vinay course, official training, Pluralsight and the exam. Mana is absent. Planner TR-281 details show 140 outcome assessments and the full 6h11m duration; learner TR-282 shows 25h30m and practice/access limitations. Both consoles are error-free. Default selections/budgets, framework prose and storage formats are preserved. Current ZIP members match the rebuilt HTML exactly. Workbook renders are retained locally in `.work/catalogue/v14/`.


## Catalogue v13 — planner 2.1.1 and learner 1.3.2

Verified 1 November 2026. [Release evidence](../../catalogue/evidence/v13/release-verification.json) records 72 planner JavaScript, 17 planner Python, 65 learner JavaScript and three learner Python checks, all passing. The Python suite needed temporary local-server permission. The normal workbook importer reconciles all 9,476 course/need results. Original formulas and unrelated records are preserved; native Excel was unavailable.

Browser checks confirmed the 529-resource catalogue in both rebuilt apps. Planner course details show TR-280's 140 outcomes, duration and evidence limitations; learner search/detail shows the revised ISC2 six-course bundle. Both browser consoles had no errors. Retained selections, overrides, budgets and framework prose remain unchanged. Release ZIP members match the rebuilt HTML exactly.

`screenshots/` contains the existing browser previews. `verification/` contains the existing release-verification JSON records. They were moved from the app root without changing their contents; embedded paths in historical records retain the original layout.

Current reorganisation checks are recorded in [docs/VERIFICATION.md](../../docs/VERIFICATION.md). Application tests remain in `training-planner/tests/`.

## Internal learning component correction — planner 2.0.9

Verified 1 November 2026. Internal selections stay in their component; prerequisite teaching appears under Inherited learning with its source and without local edit/remove controls. Add/edit actions stay bound to the component editor after a different catalogue destination was selected. Catalogue-created briefs retain the explicitly selected destination.

- 67 JavaScript regression checks passed, including shared coverage/time deduplication and schema-3 backup/import compatibility.
- 14 Python regression checks passed, including standalone packaging and temporary local-server checks.
- Two Playwright browser regressions passed against the rebuilt standalone HTML. They exercise actual Foundation/L1/L2/L3 creation and navigation, unrelated specialism isolation, audience aggregation, persistence after reload, inherited ownership, and add/edit/remove after catalogue navigation.
- The corrected layout was visually inspected at 1440 × 1000. Screenshot: [component internal learning](screenshots/internal-learning-components.png).

Run the browser checks with Playwright available: `node --test training-planner/tests/component-ui.browser.cjs`. Set `PLANNER_QA_DIR` to an existing directory to capture the layout screenshot. The checks use isolated temporary browser contexts and leave personal browser plans untouched. The Python checks used the bundled runtime's existing `openpyxl` library; local-server/browser tests required permission to run outside the restricted process environment.

## Proposed-training Excel register — planner 2.1.0

Verified 1 November 2026. 72 JavaScript checks, 17 Python checks and four standalone-browser regressions passed. The two Excel browser checks were repeated against the final 2.1.0 build.

- An actual catalogue copy gained only the Proposed training worksheet and the three workbook registration parts. Every original worksheet, cached formula, style, table and other package part retained identical bytes. An independent `openpyxl` read verified the new sheet, numeric zero versus blank unknown hours, multiline text, text beginning with `=`, source assignments, status validation, filters and frozen headings.
- The normal catalogue importer reconciled all 9,453 course/need rows from the exported workbook. After excluding source identity and the new proposal register, its complete imported content matched the active v12 snapshot exactly. Proposal data is retained separately and gives no assessment credit.
- Browser export/reload retained item details, distinct component variants and other scenarios; repeated export updated matching records without duplication. Repeated import updated a chosen component without assigning the item to other components. A separately tested catalogue payload exposed saved proposals without selecting a workbook again, while blank-plan selections remained blank until the user added an item.
- A preview of the new sheet's native values/styles was visually checked. The full-workbook renderer exceeded its memory limit; visual review used a small view reconstructed from those native fields, alongside the independent file/package checks. [Saved-proposal picker](screenshots/proposed-training-import.png) shows the app flow. Test workbooks and rendering scratch are kept in ignored `.work/proposed-training/`, with no test proposals added to the live catalogue.

The standalone ZIP is verified against the HTML and its release-manifest hashes. Current workbook/snapshot bytes, retained starters, model/crosswalks and learner app are unchanged. Excel export creates a downloaded copy; the user saves it as their working catalogue. Native Microsoft Excel was not automated during verification.


## Maintained internal catalogue — planner 2.1.3 / catalogue v15

Verified 1 November 2026: 75 planner JavaScript checks, 65 learner JavaScript checks, 17 planner Python checks, 3 learner Python checks and 5 isolated browser regressions passed (165 total). The final browser suite includes selecting the actual AI use cases entry from Full catalogue in a blank plan, preserving all fields, choosing Foundation while viewing L1, checking no direct L1–L3 assignment, and reloading the saved plan. Excel export/update/import was rerun against v15 with its pre-existing internal record.

The live Safari planner was refreshed at its existing file path. Version 2.1.3 shows catalogue v15 and the actual saved brief under Full catalogue → Internal training. The user's existing Foundation/L1 selections and Foundation brief were retained. The saved scenario keeps its previous catalogue identity until the user acknowledges it; no plan was rewritten during this smoke test.

[Internal catalogue screenshot](screenshots/internal-catalogue.png). [Workbook provenance and preservation checks](../../catalogue/evidence/v15/README.md) document the actual record, unchanged assessment content and Excel layout check. Both release ZIP members match their rebuilt source HTML and manifest hashes. Scratch test workbooks remain under ignored `.work/proposed-training/`.

## Specialism and tool pathways — planner 2.2.0

Verified 1 November 2026: 78 JavaScript checks, 17 Python checks and seven standalone-browser regressions passed. [Verification record](verification/pathways-2.2.0.json) captures the scope. Isolated browser contexts and the server-security test required execution outside the sandbox; the workbook checks used the bundled Python runtime's existing openpyxl.

Specialism cards open the component editor, optimise within budget, apply selections and save internal practice independently of shared learning. All nine role filters render correctly. Tool pathways validate product/tasks, find matching resources, preview/add selections, expose unknown time, accept product practice without linked outcomes, compose into audience paths and persist after reload. No-match discovery can switch back to all resources. Existing internal-learning/inheritance, workbook round-trip and catalogue-proposal regressions also pass.

All five embedded inputs match the previous 2.1.3 distribution exactly, preserving catalogue/model, blank starter and legacy default. Storage keys and schema remain unchanged. The 2.2.0 ZIP contains the exact rebuilt standalone HTML and its hashes are recorded in the release manifest.

Visually inspected: [specialism cards](screenshots/specialism-pathways.png), [tool pathway editor](screenshots/tool-pathway.png) and [matching tool resources](screenshots/tool-pathway-resources.png).
