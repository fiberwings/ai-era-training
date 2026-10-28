# Cyber capability planner

A local workshop app using the versioned Excel catalogue (currently v11). Source assessment evidence is retained; role-number labels follow the current model. Capability model v2 is a separate, versioned applicability overlay. The app ships with the editable annual v3 recommendation and the full catalogue. The approved must-have review is recorded in catalogue v11; older plans show review warnings.

For the business context, agreed scope, decisions and implementation handover, read [Project context](../PROJECT_CONTEXT.md).

## Capability model v2 revision 3 — 18 October 2026

The model is **Foundation + agentic level + relevant role specialisms + tool training**. Read the one-page explanation and complete outcomes in [the capability model](../Agentic-Era_Workforce_Capability_Model.md); the planner also has a **Capability model** view. [CSV crosswalk](../Capability_Model_Crosswalk.csv) and [JSON crosswalk](public/data/capability-crosswalk.json) map all 140 outcomes while retaining the 23 original scoring groups.

The opening explanation describes levels, the nine previously defined roles with their ECSF mapping, and tool training assigned by access and intended work. Examples cover general products, incident-response tools and application-security use versus harness building. **From the model to learning needs** introduces topics, detailed outcomes and current-capability evidence, and classifies all 23 needs by primary content: 11 generic and 12 cyber-specific. **From target work to a training plan** then connects them to training, cohorts and delivery. Content category is independent of audience and does not change scoring or applicability.

- Foundation is common knowledge, not a fourth level. L1 means work with AI assistance; L2 means supervise agents; L3 means build and evaluate agents, including no-code/low-code builders.
- **Level, roles & tools** in the cohort planner edits these dimensions independently. GRC has L2 and L3 examples, IAM operations can be L1, and leadership no longer implies L3. Role packages describe responsibilities, not grades. Confirm role prerequisites separately.
- **Learning outcomes** fine-tunes applicability with a rationale. Shared learning is inherited once. Parent cohorts must contain shared learning at or below the target level, so an L1 profile cannot accidentally inherit L3 training or another job's specialisms. Without a parent, the cohort plans its entire target profile.
- Record approved tools on the profile, then browse and manually select tool training. Unassessed tool metadata earns no coverage; its time still counts. Tool products are deliberately unassigned until functional heads confirm adoption.
- The new starter has 23 editable cohort presets. Provisional course budgets split the former 4h Foundation/Entry budget into 2h + 2h, followed by 8h L2, 24h L3 and 4h role additions. The distributed starter is the curated 2027 version-3 recommendation. Foundation now has a 2h course budget and assigns only the 1h45 AI-literacy course. Social engineering and deepfakes receive a 10-minute awareness segment within existing bank practice. Architecture uses a 4.25h course budget and BISO 5h; internal practice is additional. All assignments require audience and delivery validation.
- Profile, applicability, budget, filter and course changes invalidate affected recommendations. Coverage recalculates immediately; marked cohorts need a fresh recommendation applied or a recorded selection review before finalisation. Descendant selections require their own review when inherited learning changes.
- Source course audience labels remain historical metadata. The audience filter allows advanced teaching that scores at least 2 on an applicable specialist outcome, independently of agentic level. This establishes teaching relevance, not learner readiness.

**Saved-plan compatibility:** new plans use scenario schema 2 and modelVersion 2. Existing schema-1 plans and imports retain their original scope and selections and show a previous-model notice. Duplicating a legacy plan retains its legacy semantics. Use **Create a plan with the current model** or **New blank scenario** for a new profile-based plan; old selections are not silently migrated. Older app versions reject schema-2 exports rather than misinterpreting them. Existing browser scenarios are not overwritten by the regenerated starter.

The current annual report is **[2027 Training Plan — v3](../analysis/2027-training-plan/2027-Training-Plan-v3.html)**. It uses capability model v2 revision 3 and catalogue v11. Its recommended scenario is the distributed starter; the previous report and default are archived unchanged in `../analysis/2027-training-plan/archive/v2-before-must-have-review-20261018/`.

### Approved essential-outcome review

N5.8 is the new cyber risk overview; N5.4 remains bank-specific attack examples. N5.1 combines social engineering and deepfake impersonation, with N5.2 retired and cross-referenced. N4 and N8 are unchanged; N6.4 is Accountability. There are 140 active outcomes, 23 equally weighted needs and 70 must-have flags including conditional essentials. Four revised/new outcomes were reassessed across all 411 Offers; other evidence is preserved.

Use the profile editor's activity checkboxes for automated judges (N11.3) and AI-assisted assurance (R6.1.2). Detailed identity delegation (R9.1.2) belongs to identity integration. Shared outcomes remain counted once when a descendant adds an essential condition. The workbook's full-need Coverage includes conditional essentials; profile calculations apply the recorded responsibilities and activities.

Older model-revision plans show a warning. In Scenario settings, applying revised applicability marks cohorts for fresh selection review and discards stale recommendations. Existing choices and internal proposals are retained; retired IDs must be reviewed explicitly. Browser-local scenarios are never overwritten by the distributed default.

All four annual scenarios are recalculated (92 profile calculations); `change-impact-v3.json` retains before/after results. The Foundation revision removes INT-2787 and reduces its course budget to 2h; other curated choices and budgets are retained. The diagnostic benchmark is reoptimised. The Foundation adds a proposed 45-minute internal risk overview, bringing its internal time to 4h45m. Proposed internal work has no assessed coverage credit.

### Maintaining the model

`public/capability-model.js` owns the presentation names, shared-level mapping and role packages. It does not alter the imported source rubric. The generated model document and crosswalk retain the source outcome wording. To revise the explanation, edit the prose in `scripts/build_capability_model.mjs` and the corresponding `modelView()` in `public/app.js`; to change applicability, edit `public/capability-model.js`. Regenerate the document and distributable:

`public/model-explanation.js` shares the existing role families, tool-training examples and need content categories between the document and planner. These are editorial labels, separate from the scoring and applicability model.

Agent infrastructure outcomes N10.3, N10.6 and N10.7 are learning needs within **Security architecture & engineering**. The internal `agent-engineering` selection key is retained for compatibility; the visible label includes its parent role. This presentation change does not add a role or change outcome applicability. Saved user-defined cohort names remain as recorded.

Similarly, N5.7 (tracking AI threats and adjusting controls) is a learning need within **Threat intelligence & detection**, rather than a separate model component. Its visible label includes the parent role; the `threat-intelligence` selection key and N5 assessment grouping are retained.

Current role numbering is **8. Identity & access management (IAM)** and **9. Leadership (CISO)**. Role numbers are presentation labels; IAM's assessed need/outcome IDs remain `R9.1` / `R9.1.1–R9.1.10`, preserving course evidence and saved plans. The workbook's Needs and Matrix role labels follow the new numbering; its README explains retained historical leadership tags `M-R8.x` / `R8.x`. Archived model versions and the v8 delivery bundle retain their historical numbering. The slide deck contains stable assessment IDs rather than numbered role labels.

```sh
node scripts/build_capability_model.mjs
python scripts/build_standalone.py
```

After an applicability change, reassess the annual configuration and run `node ../analysis/2027-training-plan/build_plan.mjs --publish` then `python ../analysis/2027-training-plan/compare_v3.py` and `python ../analysis/2027-training-plan/build_report.py` before packaging. `scripts/seed.mjs` creates a generic score-optimised starter and would replace the curated annual recommendation; use it only when that replacement is intended. Prose-only edits do not require recalculation.

Run the tests after a mapping change. A substantive outcome rewrite requires course reassessment; a display grouping must not merge the original scored need IDs. For a new workbook with additional outcomes, review the overlay and regenerate the crosswalk before publishing the revised model. The original model and starter are preserved in `../model-history/` and `scenario-history/`.

## Distribute and open one HTML file

Send **`Training-Planner.html`** to workshop participants. Save it locally and open it in a desktop browser. The file contains the full catalogue, styles, application code, default draft and HiGHS optimisation solver. Recipients need **no Python, Node.js, server or internet connection** for planning. Course links open externally when clicked. Use a current desktop Chrome or Edge; a company policy that prohibits local JavaScript, Blob workers or WebAssembly can prevent recommendations.

Close the browser tab to stop; reopen the same HTML file to restart. The file is about 30.6 MiB, so it can also be zipped for distribution. There are no companion files to copy. `public/index.html` is the development entry point and still needs the optional server below; distribute **`Training-Planner.html`** instead.

**Save your decisions using Scenario & exports → Export reloadable JSON.** Opening the HTML does not write your edits back into that file. Browser autosave is a convenience tied to the browser/profile and, for local files, browser-specific file-location rules. Export JSON before moving, renaming or replacing the HTML, switching browsers, or clearing browser data. Use **Import scenario JSON** to reload your decisions into a new copy. Sharing the HTML shares the catalogue and default draft; send scenario JSON alongside it to share your proposed plan.

If you used the earlier localhost app, export your existing scenarios there first, then import them into the standalone HTML. Browser storage does not transfer between these locations automatically.

## Synchronise Excel and regenerate the HTML — Python only

### Release version and date

The planner displays its release version and date on every view, including presentation mode and the printed plan. The browser tab also shows the version. The current release is **1.1.1 — 18 October 2026**. This identifies the whole distributed planner, separately from catalogue v11, capability model v2 and scenario versions.

Before distributing any revised app, catalogue or default proposal, update `version` and `date` in **`public/release.js`**, then run the packaging command below. Use increasing versions (`1.0.1`, `1.0.2`, etc.; `1.1.0` for a feature release) and an ISO release date (`YYYY-MM-DD`). Keep the same version/date when rebuilding the same release; the date must not change just because someone opens the app. The module is bundled into the standalone HTML, so both app modes show the same release information.

Offline copies cannot discover future releases automatically. Include the latest version/date in your distribution message so recipients can compare it with their copy. No online version check or expiry is used. Export scenario JSON before replacing an older HTML, then import it into the new release if necessary.

### Build the distribution

Keep the source project on the machine where you update the catalogue. From `training-planner`, use Python 3.9 or later (`py` on some Windows machines; `python3` on macOS/Linux).

Install the Excel-reading dependency once:

```sh
python -m pip install -r requirements.txt
```

After saving and recalculating Excel, run:

```sh
python scripts/build_standalone.py --workbook ../AI_Era_Cyber_Training_Catalogue_v11.xlsx
```

This performs the validated, read-only Excel refresh described below, with change reports and archived catalogue snapshots, then regenerates **`Training-Planner.html`**. Future versions use the same command with the new workbook filename. Distribute the regenerated HTML; recipients do not need the workbook or Python. Preserve the filename and location when replacing your own copy, and keep a scenario JSON backup. Reload the tab to pick up the new catalogue and review any catalogue-version warnings.

To package the current snapshot without reading Excel (Python standard library only):

```sh
python scripts/build_standalone.py
```

An optional `--output "path/to/Planner.html"` chooses another output file. Packaging is deterministic and atomically replaces the HTML only after all assets have been assembled. If packaging fails, the previous HTML remains usable; a successful Excel refresh before that failure will already have updated the separate local-server snapshot. Fix the packaging error and rerun without `--workbook`.

The source workbook, default draft and browser scenarios are never rewritten by packaging. Each distributed HTML contains its own catalogue version: publishing a new snapshot does not update previously distributed copies.

## Optional local-server mode

If you prefer the existing stable localhost address, run:

```sh
python server.py
```

Open **http://127.0.0.1:4173**. Leave the terminal running; stop with Ctrl+C and restart with the same command. The server needs only Python's standard library. Copy the entire `training-planner/public` tree, including data and vendor assets, when using this mode. Node.js and npm are optional developer tools only.

If the address is already in use, check whether the app is already running; do not stop an unidentified process. Browser autosaves belong to the exact address and profile. Changing to `localhost`, a different port or a different browser uses a different store. Use scenario JSON exports to transfer plans.

## Workshop workflow

1. Review the seeded draft in **Plan overview**. Functional specialisms are alternative branches, not assignments for everyone in a function.
2. Duplicate the scenario before discussing alternatives. Set the current cohort in the left rail.
3. Review applicability, inherited learning, hours budget and recommendation filters. The scope presets are editable proposals. A change requires a rationale.
4. **Recommend within budget** proposes an optimised combination without changing the current selection. Pin courses that must remain. Apply the result only after reviewing the comparison.
5. **Coverage & gaps** separates possible course supplements from internal completion. Expand a need to inspect requirement-level evidence and source rows.
6. Add internal learning, practice or assessment with an owner, time estimate and linked requirements. These items affect total effort but never automatically increase assessed coverage.
7. Use **Full catalogue** for manual alternatives. Every candidate shows standalone and additional coverage, eligibility and links. Manual selections can exceed the budget or filters and are clearly flagged.
8. Export JSON for portable backup/reloading, CSV for the course plan or gap register, and **Print plan** for a readable browser PDF. Finalising locks the scenario; duplicate it to make a new draft.

Internal items carry a **Not in catalogue** badge. **To be built** (saved status: Proposed) and **In development** use amber badges and dashed cards; **Ready for delivery** uses a green badge. These labels appear in the overview, planner, inherited learning, gap evidence, comparison and printed plan. Development counts and planned learner hours remain visible in the overview. Marking an item ready does not make it an assessed catalogue course or increase coverage.

The initial draft is a mathematical coverage recommendation, not a validated endorsement of course quality or suitability. It can select non-cyber courses with transferable scored content, or several short readings, because no resource-count limit was requested. Review fit notes, prerequisites, critical gaps and practical evidence. The UI's unique contribution value measures the coverage lost if that course is removed from the current selection; it is not an independent score.

## Calculation rules

- Each active requirement takes the maximum recorded score across selected courses (0–3). No overlap is double counted. Missing assessment contributes zero mathematically but stays visibly distinct from an explicit score of zero.
- Need coverage is `sum(scores) / (3 × applicable requirements)`. Cohort coverage is the equally weighted mean of need percentages. The workbook's band thresholds are retained. Critical gaps count must-have requirements at zero, not every requirement below three.
- Optimisation uses HiGHS mixed-integer programming in a Web Worker. Binary course choices and threshold variables for requirement scores maximise the equally weighted need coverage within the layer budget. Pinned courses are compulsory. Ties prefer fewer hours, then fewer courses. Inherited courses cost no additional hours. There is no course-count limit.
- A 15-second total solve budget covers the primary objective and tie-breaking. “Optimal coverage” is displayed only when the primary optimum is proven. The pinned HiGHS JavaScript build does not expose a MIP gap; the UI says so instead of inventing one. A 20-second worker watchdog includes startup and protects the UI.
- Recommendations are conditional per-cohort optima, not a single global optimum across all pathways. Changing a shared selection immediately updates descendant coverage and time; rerun downstream recommendations to adapt their choices.
- By default, higher/unknown source audience levels for shared learning (with the specialist teaching exception above), certification-only records, practice tests, unavailable/rejected courses, unassessed records and ambiguous durations do not enter automatic selection. Filter settings and manual choices are editable. Descriptions-only evidence remains eligible and is labelled in course details.
- Gap ceilings inspect all recorded scores, including courses outside eligibility filters. “No assessed teaching found” means maximum score 0 or 1 in this snapshot, not that no training exists in the market. Tool-training metadata is not inferred to provide scores.
- Explicit duration ranges use their upper bound. Full-course hours are used even when the source mentions a short core excerpt. Unknown days, modules, access windows and exam-only duration are not silently converted to learning time. Planner overrides are full-course estimates and remain labelled.
- Cumulative learner effort deduplicates inherited course IDs and internal item IDs. Unknown durations remain unresolved and are shown alongside the known total. Practical sign-off and learner completion management are outside this app.

## Refresh from Excel — repeatable Python workflow

Excel owns the course catalogue, requirements, assessments and evidence. Browser scenarios own planning decisions. Save and recalculate Excel before refreshing: `openpyxl` reads cached formula results but does not calculate Excel formulas. Original workbooks are never modified.

One-time dependency for Excel refresh only:

```sh
python -m pip install -r requirements.txt
```

If package installation is restricted, ask IT to provide `openpyxl` through the approved Python environment. Offline installation is also possible using approved wheels and dependencies supplied by IT. The app launcher does not need this package.

From `training-planner`, optionally check the update first:

```sh
python scripts/refresh_catalogue.py ../AI_Era_Cyber_Training_Catalogue_v11.xlsx --check
```

Publish the validated update for the optional local-server app (use `build_standalone.py --workbook` above to refresh and package in one command):

```sh
python scripts/refresh_catalogue.py ../AI_Era_Cyber_Training_Catalogue_v11.xlsx
```

Pass the workbook path explicitly each time; quote paths containing spaces. Future catalogue versions use the same command with their filename. The script:

1. Imports Offers, Tool track, Needs, Rubric, Scores, Scoring guide and Build items, plus V8 audit when present. It ignores the outdated Matrix.
2. Checks IDs, duplicate assessments, scores, thresholds and requirement references, then independently reconciles coverage, scope, assessed counts, critical gaps and bands against Excel. Missing or stale formula caches stop publication with an error.
3. Preserves explicit unassessed rows separately from numerical zero, imports evidence and audit fields, and derives the assessment date from the score dates.
4. Reports additions, removals and changes. Full course/requirement changes are saved as a timestamped JSON report in `catalogue-history/`.
5. Archives the previous and new JSON snapshots and atomically replaces `public/data/catalogue.json` only after validation. A failed validation leaves the active file untouched. Repeating an unchanged refresh does not create more backups.

In local-server mode, refresh the browser after success; **no server restart is needed**. A standalone HTML must be regenerated and redistributed separately, or use the combined command above. Existing selections, pins, budgets and internal items stay in browser storage. Their coverage and gaps are calculated against the newly loaded catalogue. The app displays a version warning; review the changes before acknowledging the new version. Recommendation generation remains an explicit action and no selections are automatically replaced. The default scenario is not regenerated by a refresh.

The current v11 snapshot contains 528 resources (411 Offers and 117 Tool track entries), 140 active requirements, 57,260 numerical assessments and 280 explicitly unassessed rows. Source workbook hashes, stable IDs and sheet/row references are retained. Snapshot identity also includes imported content and schema, so a meaningful importer change is detectable.

To verify the active snapshot again:

```sh
python scripts/verify_workbook.py ../AI_Era_Cyber_Training_Catalogue_v11.xlsx
```

To roll back, use the version hash shown in a change report or archive filename:

```sh
python scripts/refresh_catalogue.py --rollback VERSION_HASH
```

Rollback restores the whole app catalogue for all scenarios, not one scenario. It also archives the current snapshot. `catalogue-history/` is outside the web-served folder. Keep it with your project backups, together with scenario JSON exports and source workbooks. A finalised scenario currently locks planning decisions; it does **not** automatically bind itself to an archived catalogue. Export a PDF/CSV and scenario JSON before changing the catalogue when you need an immutable approved record.

`import_catalogue.py` is retained as an alias for the validated refresh command and also requires an explicit workbook path.

Python checks (no Node required):

```sh
python -m unittest discover -s tests -p "test_*.py"
```

Optional developer checks and seed regeneration still use Node; these are not needed on the work machine:

```sh
npm test
node scripts/seed.mjs
```

## Implementation

- `Training-Planner.html`: self-contained distribution with embedded catalogue and solver; no server needed.
- `scripts/build_standalone.py`: Python-only packager; optional validated Excel refresh in the same command.
- `public/`: buildless UI, scoring, duration, scope, storage and optimisation modules; catalogue and seeded draft; vendored HiGHS 1.14.2 assets and MIT license.
- `scripts/`: validated Python workbook refresh, independent reconciliation, change reports and rollback; optional JavaScript seed generator.
- `tests/`: meaningful calculation and optimiser tests, including comparison with exhaustive enumeration on small problems.
- `server.py`: Python standard-library local launcher with the same security policy and asset types; `server.mjs` remains an optional Node alternative.
- `catalogue-history/`: previous snapshots and timestamped change reports; never served by the launcher.

Scenarios live only in this browser's local storage. There is no login, cloud synchronisation, automatic submission to any provider, or shared multi-user editing. Download JSON before clearing browser data or moving to another device. Exports may contain internal links and planning notes; share them using your normal internal channels.

## Standalone verification

The package passed browser checks for catalogue rendering, the embedded solver, JSON export/import, persistence after reload and presentation mode, when served as the only available file on localhost. The browser testing tool prohibits `file://` URLs, so direct opening and local-file autosave remain manual checks on the work machine. The original verification was thirteen Python checks and fourteen JavaScript checks. The v2 regression suite adds profile, mapping and compatibility checks; see the current verification note below.

## Corporate-scope revision — 16 October 2026

V9 removed TR-127, the CERT-FR personal-assistant workstation-risk bulletin, from Offers and its assessment/coverage records at the project owner’s request. The Screening log records why; v8 is preserved. This exclusion remains in v10. Existing browser scenarios are retained and may flag the removed ID; import a revised 2027 scenario or review any affected selections.

The current [2027 version-3 report](../analysis/2027-training-plan/2027-Training-Plan-v3.html) recommends 22 distinct resources, including eight DeepLearning.AI courses, and 28 proposed internal modules across 23 editable profiles. The pack contains the recommendation, code-ready and coached adaptations, a score benchmark, seven CSVs and verification. Course evidence remains separate from competence and unassessed internal proposals. All four scenarios exclude TR-125/TR-128/TR-129 and unscoped TR-159 from global recommendations. No approved product access is assumed. Existing browser scenarios are not overwritten.

## Historical v2 verification — 17 October 2026

Twenty-seven JavaScript checks and thirteen Python checks pass. They cover all 140 crosswalk outcomes, independent role applicability at every agentic level, additive shared scopes, safe building, advanced role-course eligibility, tool evidence separation, scenario schema compatibility, recommendation invalidation, deduplicated time, the recalculated starter, optimisation and standalone packaging. Workbook and catalogue SHA-256 hashes are unchanged. The current annual report independently reconciles 92 cohort calculations and all 140 outcomes; archive preservation is checked by SHA-256.

Browser checks verified the previous-model notice, separate v2 scenario creation, GRC L2 and L3 profiles, IAM L1, profile editing and review flags, proposal/apply, persistence after reload, 117 tool-training entries, CSV/JSON exports and the model explanation. The final HTML was also served alone from a temporary directory: its embedded solver ran with no companion files and no console warnings/errors. Direct file opening and native PDF layout remain manual work-machine checks.

## Historical v10 DeepLearning.AI catalogue review — 18 October 2026

V10 screens all 131 offerings in the provider's current directory, cross-checked against its sitemap: 104 additions (TR-176–TR-279), seven existing courses rechecked and 20 exclusions. Each addition has explicit assessments against all 140 requirements. Screening log rows 87–217 record every decision and its source. Public objectives, lesson outlines and exercise descriptions were reviewed; gated lessons and delivery were not completed. Certificate components are assessed within their programme to avoid duplicate entries.

Existing assessment values and evidence remain unchanged. Six existing duration/access records are refreshed; TR-098 retains its Coursera estimate, with the alternative DeepLearning.AI duration explained separately. Membership and external API costs require checking at enrolment. TR-279 has a provider deprecation notice and is labelled **Needs delivery validation**: its evidence remains visible, but automatic recommendations exclude it.

The original v9 workbook is archived unchanged in `../catalogue-archive/AI_Era_Cyber_Training_Catalogue_v9.xlsx`; its JSON snapshot is retained in `catalogue-history/a959067fd5d91eba.json`. The starter's prior decisions are archived in `scenario-history/default-scenario-before-v10.json`. The subsequently approved annual-plan updates supply the curated version-3 starter. Its configuration and proposed internal briefs are maintained in the annual analysis folder; it is not the automatic score optimum. Browser-local scenarios are not overwritten. Research records and workbook validation are in `../.catalogue-v10/`.

Validation passes: all 9,453 Coverage rows reconcile; 459,022 formula results match independent native recalculation with no errors; 27 JavaScript and 13 Python tests pass. Native-style workbook extracts were rendered and inspected. The published workbook retains its original Excel formatting rather than the recalculation engine's export.

## V11 / planner 1.1.0 verification — 18 October 2026

All 28 JavaScript and 13 Python regression tests pass, including unchanged-evidence preservation, conditional essentials, inherited essentials and identity applicability. The native workbook recalculated 461,493 formulas with no errors; independent import reconciled all 9,453 course/need results. The four annual scenarios independently reconcile 92 profile calculations and all 140 outcomes; 67 archived-file hashes are verified. The updated standalone includes catalogue v11 and the annual v3 starter. Reassessment and change-impact records remain inspectable; proposed internal content earns no score credit.

## Foundation simplification — planner 1.1.1

INT-2787 is removed from Foundation and inherited learning. Foundation recommendations exclude it even with the audience filter disabled; its catalogue evidence remains available for relevant specialist use. Previously saved plans that assign it to Foundation show a removal warning. The current annual v3 Foundation revision assigns INT-437 (1h45), keeps 4h45 proposed internal learning, and totals 6h30 per learner—2h03 less than the preceding v3 plan. A 10-minute social-engineering/deepfake awareness segment sits inside the existing one-hour bank session. All four scenarios are recalculated; the earlier v3 outputs are archived under `archive/v3-before-foundation-simplification-20261018/` in the annual analysis directory.
