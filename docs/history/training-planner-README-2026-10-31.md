# Cyber capability planner

## Current release: 2.0.8 — 31 October 2026

Release 2.0.8 restores structured **Course detail** in both workspaces through a shared presentation. Metadata badges, Overview, Learning commitment, Access & cost, contextual fit, limitations, grouped outcome evidence and supporting sources separate the information. The current component or learning-group scope is the default, with All outcomes available; assessed zeros and unassessed records remain distinct. Current selection, additional assessed coverage, full-course hours and budget impact use the existing scoring and duration rules. The header and actions remain visible while the content scrolls, and evidence stacks at narrow widths. Preview addition is the primary action; planning-hour changes remain secondary. Finalised plans show read-only details. Historical source reviews are labelled separately from later outcome assessments. Catalogue evidence, scoring and saved-plan formats are unchanged.

Release 2.0.7 reorganises **What is covered. What comes next.** in both workspaces into a coverage snapshot and a need-by-need review. Four non-overlapping counts distinguish no coverage, partial coverage, internal-dependent planned coverage and full selected catalogue evidence. Priority shortcuts surface must-haves at zero, all incomplete must-haves and gaps the assessed catalogue cannot fully close. Learning needs and outcomes can be sorted by priority, lowest planned coverage or ID, with search and filters for status, importance and category. The need list retains full-scope percentages, bands and counts while showing filtered match counts. Outcome details expand on demand with the existing evidence and planning actions; all matching outcomes and expand/collapse controls support broader reviews. Filters and open details persist when returning to the same scope during the session. CSV and print remain complete and unfiltered. Scores, applicability, saved plans and catalogue data are unchanged.

Catalogue v12 (31 October 2026) reassesses two Anthropic courses using public lessons and exercises. TR-145 is a 3.5h Foundation AI-limitations course with L1 practice (N3 76%, N6 54%). TR-089 is a 4h L1 AI-fluency course with supporting Foundation content (N6 67%); its four core N6 outcomes have full teaching and practice. These aggregate bands remain Partial. Other courses and the 140-outcome rubric are unchanged. Previous static analyses retain their original catalogue snapshots. The app’s bundled scenario retains the annual plan’s decisions with a refreshed catalogue identity; previous analysis files are unchanged.

Release 2.0.5 removes automatic changed-input review requirements from both workspaces: no review flags, warning banners or selection-review recording steps. Changes still recalculate coverage and learner time across dependent paths. Previously saved review flags and notes are ignored; they do not block finalisation. Catalogue/model version and unresolved-reference checks remain in place.

Release 2.0.4 groups the internal-training outcome picker by learning need. A need checkbox selects or clears all outcomes currently shown in that need, with a mixed state for partial selection. Search matches need names, outcome IDs, titles and descriptions. The list starts with the current component/cohort and can show remaining plan gaps, all outcomes or selected outcomes. Select shown / Clear shown affect only visible matches; counts identify selections outside the filter, and saving retains them. The picker is shared by both workspaces.

Release 2.0.3 searches course names, providers and descriptions in both workspaces, with case-insensitive words and surrounding whitespace ignored. Opening Full catalogue clears a previous outcome-gap restriction, and selecting a tooling component no longer hides other providers from the full catalogue. Search results update without replacing the input while typing. The search field expands across the available space and wraps above other filters on smaller screens.

Release 2.0.2 recalculates planned gap coverage from manually added internal training and its linked outcomes. Planned coverage is visible alongside assessed catalogue coverage in both workspaces, including dependent paths, gap views, CSV and print.

Release 2.0.1 restores the original planner's numbered navigation, coverage cards, progress bars, course cards, compact action menu and presentation mode in the component workspace. **Capability model** again contains the complete explanation on one page: the four building blocks, L1/L2/L3 definitions and boundaries, nine roles, tooling examples, learning-needs explanation, essential outcomes, worked profiles, planning workflow and grouped outcome crosswalk. Both workspaces render this explanation from `public/capability-view.js`. Printing from the model page prints the model explanation; printing from a planning view retains detailed path coverage.

New plans use reusable **Foundation, L1 Entry, L2 Practitioner, L3 Expert, Specialisms and Tooling** components. Open **Learning components** to plan teaching, **Audience paths** to compose an audience, and **Path coverage** to inspect every need and detailed outcome. Foundation starts with 29 outcomes across N1–N5. The 21 initial components contain no course selections or internal commitments; the 19 audience templates retain the current responsibilities and activity choices.

Course budgets start at Foundation 2h, L1 2h, L2 8h, L3 24h and 4h for each specialism component. Several selected specialisms have separate component budgets. Internal practice adds learner time outside these budgets. Tooling starts unassigned: create an approved product/task component (use, supervise, build or administer), then assign it to audiences. Tool budgets are initially unset. Product/task matching uses the already reviewed v11 task metadata; uncertain matches require review and never create assessment evidence.

Shared edits update every audience referencing a component. **Create audience-specific copy** makes a local variant and rewires copied shared dependants, preserving the original for other audiences. Each composed path counts courses, outcome IDs and internal items once. Explicit conditional activities control must-have status. Recommendations optimise one component and its shared prerequisites; specialist components remain independent of agentic level. Tooling is selected manually when unassessed.

**Path coverage** shows purpose, full outcome descriptions, applicability, scores, evidence, catalogue ceilings and linked internal teaching. Filters show all outcomes, incomplete outcomes, must-have outcomes at zero, or incomplete outcomes without internal teaching. **Explore options** ranks improving assessed resources by marginal coverage and time, explains eligibility/budget restrictions and previews changes before applying them. CSV and print retain detailed outcome evidence and catalogue identity. A score of 3 is rubric coverage, not learner competence; internal Ready status is delivery readiness, not assessment credit.

Finalisation retains the existing version/reference checks. Changes to planning inputs do not require a recorded review. Coverage gaps do not add a finalisation gate. Finalised decisions are read-only, but coverage is calculated against the loaded catalogue rather than an automatically archived snapshot. Save JSON plus CSV/print for the approval record.

### Custom training and planned gap coverage

Adding or editing an item under **Internal learning & practice** immediately recalculates **Planned coverage** from the outcomes linked to it. Each checked outcome means the training will fully cover that outcome, including proposed or in-development training. Removing the item or a link reopens the corresponding plan gap. Shared internal teaching contributes once and flows through to dependent audience paths. Existing linked internal items are included when a saved plan is opened.

Planned coverage combines assessed catalogue scores with linked internal outcomes, using the same best-score and equal-need weighting rules. **Assessed coverage** remains a separate measure of catalogue evidence; delivery status does not create assessment credit. Both the component and legacy workspaces show planned coverage, with planned outcome scores included in coverage CSV exports and planned totals in print views. Recommendations continue to optimise assessed catalogue evidence.

### Existing plans and compatibility

Existing schema-1 and schema-2 plans open in the **Legacy plan** workspace, with their decisions and original planning behaviour retained. Use **New component plan** there to begin the blank structure. The new workspace can switch to existing plans through the scenario selector and can import either format. Saved browser plans are never cleared or automatically converted.

Schema 3 stores reusable `components` and `audiences` with component references. The new distributed starter is `public/data/component-starter.json`. The existing `public/data/default-scenario.json` and its annual scenario remain unchanged for the learner companion. New schema-3 JSON is not a learner-companion publishing format; support for that interface is deferred. Shared legacy APIs remain supported.

The current catalogue is **v12**, snapshot **6db669ed065cab54**. TR-089 and TR-145 were reassessed on **31 October 2026**; other assessments retain their original dates. Workbook SHA-256: `6abef4de79f652a227984bdb67624cebd81ff96a656d33d8414c099ff49ef87c`. All **9,453** course/need rows reconcile. Model applicability remains version 2, revision 3. Crosswalks add a `categories` field / Learning categories column without changing historical source fields.

The release strip and page footer identify application, catalogue, model and scenario versions separately. A stale scenario identifies the saved and loaded snapshots; scenario settings accept the matching archived catalogue JSON for a detailed comparison. Without it, the app reports missing references and explicitly states that a detailed comparison is unavailable. Review before acknowledging an update. Duplicate a finalised plan before changing its saved version.

### Existing cohort destinations

The shared records `all`, `entry`, `practitioner` and `technical` become `foundation`, `l1`, `l2` and `l3`. All 19 specialist audience IDs remain unchanged: `governance`, `grc-builder`, `leadership`, `cdc`, `forensics`, `threat-intelligence`, `idp`, `biso`, `testing`, `redteam`, `exposure`, `harness`, `architecture`, `engineering`, `security`, `transformation`, `iam`, `iam-integration` and `cio`. Their components are derived from their existing target level and responsibility-package IDs, and their conditional activities include the shared prerequisite settings. Previous department labels remain secondary audience context.

### Build this release

```sh
node scripts/build_component_starter.mjs
node scripts/build_capability_model.mjs
python3 scripts/build_standalone.py
npm test
python3 -m unittest discover -s tests -p 'test_*.py'
```

The component starter is deterministically generated from the current catalogue and legacy audience templates; it clears selections, internal work and old recommendation state. Do not run the older `seed.mjs` to generate the component starter. The standalone packager rejects mismatched catalogue or model identities in either starter and the crosswalk. Changes to assessed applicability still need the separate review described below.

The sections below document the retained legacy workflow and historical releases where applicable.


A local workshop app using the versioned Excel catalogue (currently v12). Source assessment evidence is retained; role-number labels follow the current model. Capability model v2 is a separate, versioned applicability overlay. The app ships with the editable annual v3 recommendation and the full catalogue. The approved must-have review is recorded in catalogue v11; older plans show review warnings.

For the business context, agreed scope, decisions and implementation handover, read [Project context](../PROJECT_CONTEXT.md).

## Capability model v2 revision 3 — 18 October 2026

The model is **Foundation + agentic level + relevant role specialisms + tool training**. Read the one-page explanation and complete outcomes in [the capability model](../Agentic-Era_Workforce_Capability_Model.md); the planner also has a **Capability model** view. [CSV crosswalk](../Capability_Model_Crosswalk.csv) and [JSON crosswalk](public/data/capability-crosswalk.json) map all 140 outcomes while retaining the 23 original scoring groups.

The opening explanation describes levels, the nine previously defined roles with their ECSF mapping, and tool training assigned by access and intended work. Examples cover general products, incident-response tools and application-security use versus harness building. **From the model to learning needs** introduces topics, detailed outcomes and current-capability evidence, and classifies all 23 needs by primary content: 11 generic and 12 cyber-specific. **From target work to a training plan** then connects them to training, cohorts and delivery. Content category is independent of audience and does not change scoring or applicability.

- Foundation is common knowledge, not a fourth level. L1 means work with AI assistance; L2 means supervise agents; L3 means build and evaluate agents, including no-code/low-code builders.
- **Level, roles & tools** in the cohort planner edits these dimensions independently. GRC has L2 and L3 examples, IAM operations can be L1, and leadership no longer implies L3. Role packages describe responsibilities, not grades. Confirm role prerequisites separately.
- **Learning outcomes** fine-tunes applicability with a rationale. Shared learning is inherited once. Parent cohorts must contain shared learning at or below the target level, so an L1 profile cannot accidentally inherit L3 training or another job's specialisms. Without a parent, the cohort plans its entire target profile.
- Record approved tools on the profile, then browse and manually select tool training. Unassessed tool metadata earns no coverage; its time still counts. Tool products are deliberately unassigned until functional heads confirm adoption.
- The retained legacy starter has 23 editable cohort presets. Provisional course budgets split the former 4h Foundation/L1 Entry budget into 2h + 2h, followed by 8h L2, 24h L3 and 4h role additions. The legacy starter is the curated 2027 version-3 recommendation; new component plans use the separate blank starter. Foundation now has a 2h course budget and assigns only the 1h45 AI-literacy course. Social engineering and deepfakes receive a 10-minute awareness segment within existing bank practice. Architecture uses a 4.25h course budget and BISO 5h; internal practice is additional. All assignments require audience and delivery validation.
- Profile, applicability, budget, filter and course changes discard affected stale recommendations. Coverage recalculates immediately across dependent paths, without review flags or an acknowledgement step.
- Source course audience labels remain historical metadata. The audience filter allows advanced teaching that scores at least 2 on an applicable specialist outcome, independently of agentic level. This establishes teaching relevance, not learner readiness.

**Legacy saved-plan compatibility:** schema-2 plans retain modelVersion 2; schema-1 plans retain their original scope and previous-model notice. Duplicating either format preserves its semantics. **New component plan** starts schema 3 with blank selections. Older apps reject newer-format exports rather than interpreting them as legacy cohorts. Existing browser scenarios are not overwritten.

The current annual report is **[2027 Training Plan — v3](../analysis/2027-training-plan/2027-Training-Plan-v3.html)**. It uses capability model v2 revision 3 and catalogue v11. Its recommended scenario remains the legacy starter and learner-companion source; the previous report and default are archived unchanged in `../analysis/2027-training-plan/archive/v2-before-must-have-review-20261018/`.

### Approved essential-outcome review

N5.8 is the new cyber risk overview; N5.4 remains bank-specific attack examples. N5.1 combines social engineering and deepfake impersonation, with N5.2 retired and cross-referenced. N4 and N8 are unchanged; N6.4 is Accountability. There are 140 active outcomes, 23 equally weighted needs and 70 must-have flags including conditional essentials. Four revised/new outcomes were reassessed across all 411 Offers; other evidence is preserved.

Use the profile editor's activity checkboxes for automated judges (N11.3) and AI-assisted assurance (R6.1.2). Detailed identity delegation (R9.1.2) belongs to identity integration. Shared outcomes remain counted once when a descendant adds an essential condition. The workbook's full-need Coverage includes conditional essentials; profile calculations apply the recorded responsibilities and activities.

Older model-revision plans show a warning. In Scenario settings, applying revised applicability discards stale recommendations and recalculates coverage. Existing choices and internal proposals are retained; retired IDs must be reviewed explicitly. Browser-local scenarios are never overwritten by the distributed default.

All four annual scenarios are recalculated (92 profile calculations); `change-impact-v3.json` retains before/after results. The Foundation revision removes INT-2787 and reduces its course budget to 2h; other curated choices and budgets are retained. The diagnostic benchmark is reoptimised. The Foundation adds a proposed 45-minute internal risk overview, bringing its internal time to 4h45m. Proposed internal work has no assessed coverage credit.

### Maintaining the model

`public/capability-model.js` owns the presentation names, shared-level mapping and role packages. It does not alter the imported source rubric. The generated model document and crosswalk retain the source outcome wording. To revise the explanation, edit the prose in `scripts/build_capability_model.mjs` and the corresponding model views in `public/component-ui.js` and `public/legacy-app.js`; to change applicability, edit `public/capability-model.js`. Regenerate the document and distributable:

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

## Synchronise Excel and regenerate the HTML

### Release version and date

The planner displays its release version and date on every view, including presentation mode and the printed plan. The browser tab also shows the version. The current release is **2.0.6 — 31 October 2026**. This identifies the whole distributed planner, separately from catalogue v11, capability model v2 and scenario versions.

Before distributing any revised app, catalogue or default proposal, update `version` and `date` in **`public/release.js`**, then run the packaging command below. Use increasing versions (`1.0.1`, `1.0.2`, etc.; `1.1.0` for a feature release) and an ISO release date (`YYYY-MM-DD`). Keep the same version/date when rebuilding the same release; the date must not change just because someone opens the app. The module is bundled into the standalone HTML, so both app modes show the same release information.

Offline copies cannot discover future releases automatically. Include the latest version/date in your distribution message so recipients can compare it with their copy. No online version check or expiry is used. Export scenario JSON before replacing an older HTML, then import it into the new release if necessary.

### Build the distribution

Keep the source project on the machine where you update the catalogue. From `training-planner`, use Python 3.9 or later (`py` on some Windows machines; `python3` on macOS/Linux).

Install the Excel-reading dependency once:

```sh
python -m pip install -r requirements.txt
```

After saving and recalculating Excel, first validate the refresh. A changed snapshot also requires review of the saved legacy starter and regeneration of the model crosswalk and blank component starter before packaging. Never acknowledge a new scenario catalogue version without reviewing its decisions. The Python packager rejects stale identities rather than silently stamping them. Once these inputs agree, run:

```sh
python scripts/build_standalone.py --workbook ../AI_Era_Cyber_Training_Catalogue_v12.xlsx
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
python scripts/refresh_catalogue.py ../AI_Era_Cyber_Training_Catalogue_v12.xlsx --check
```

Publish the validated update for the optional local-server app (use `build_standalone.py --workbook` above to refresh and package in one command):

```sh
python scripts/refresh_catalogue.py ../AI_Era_Cyber_Training_Catalogue_v12.xlsx
```

Pass the workbook path explicitly each time; quote paths containing spaces. Future catalogue versions use the same command with their filename. The script:

1. Imports Offers, Tool track, Needs, Rubric, Scores, Scoring guide and Build items, plus V8 audit when present. It ignores the outdated Matrix.
2. Checks IDs, duplicate assessments, scores, thresholds and requirement references, then independently reconciles coverage, scope, assessed counts, critical gaps and bands against Excel. Missing or stale formula caches stop publication with an error.
3. Preserves explicit unassessed rows separately from numerical zero, imports evidence and audit fields, and derives the assessment date from the score dates.
4. Reports additions, removals and changes. Full course/requirement changes are saved as a timestamped JSON report in `catalogue-history/`.
5. Archives the previous and new JSON snapshots and atomically replaces `public/data/catalogue.json` only after validation. A failed validation leaves the active file untouched. Repeating an unchanged refresh does not create more backups.

In local-server mode, refresh the browser after success; **no server restart is needed**. A standalone HTML must be regenerated and redistributed separately, or use the combined command above. Existing selections, pins, budgets and internal items stay in browser storage. Their coverage and gaps are calculated against the newly loaded catalogue. The app displays a version warning; review the changes before acknowledging the new version. Recommendation generation remains an explicit action and no selections are automatically replaced. The default scenario is not regenerated by a refresh.

The current v12 snapshot contains 528 resources (411 Offers and 117 Tool track entries), 140 active requirements, 57,260 numerical assessments and 280 explicitly unassessed rows. Source workbook hashes, stable IDs and sheet/row references are retained. Snapshot identity also includes imported content and schema, so a meaningful importer change is detectable.

To verify the active snapshot again:

```sh
python scripts/verify_workbook.py ../AI_Era_Cyber_Training_Catalogue_v12.xlsx
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


### Release 2.0.0 verification

42 planner JavaScript checks, 65 learner-compatibility checks and 14 planner Python checks pass. All 9,453 workbook coverage rows reconcile; the workbook, catalogue JSON and legacy default scenario are byte-for-byte unchanged. The learner companion builds successfully to a temporary output against the shared modules. Browser checks cover the new workspace, embedded solver, tooling, detailed gaps, internal learning, audience composition, exports/imports, persistence and finalisation with visible gaps. The standalone runs when served as the only file, without console warnings or errors. Direct local-file opening/autosave and native print/PDF layout remain manual work-machine checks; the browser test environment blocks `file://` navigation. See `verification-v2.0.0.json` for the verification record.

### Release 2.0.1 verification

42 planner JavaScript checks and five standalone packaging checks pass. Both workspaces use the same complete model explanation, with all 140 active outcome identifiers verified. The isolated standalone browser check confirms the restored cards/navigation, model explanation, presentation mode, recommendations, persisted course selections and detailed Foundation CSV export. Screenshots are in `restored-planner-preview.png` and `restored-model-preview.png`. Direct local-file opening and native print/PDF layout retain the manual-check boundary noted above.


### Release 2.0.2 verification

45 JavaScript checks and 14 Python checks pass. Browser checks verify internal training add/edit/remove, gap filtering, separate assessed/planned CSV scores, legacy-plan coverage and standalone persistence. The isolated single-file release reports no console warnings or errors. See `verification-v2.0.2.json` and `internal-coverage-preview.png`. Direct local-file opening and native print/PDF layout retain the manual-check boundary noted above.


### Release 2.0.3 verification

47 JavaScript checks and five standalone packaging checks pass. Browser verification covers provider and description searches, case/whitespace handling, clearing a gap-specific filter on Full catalogue navigation, stable focus, wider fields in both workspaces, and the isolated single-file release. Anthropic returns 18 matches. See `verification-v2.0.3.json` and `catalogue-search-preview.png`.


### Release 2.0.4 verification

50 JavaScript checks and five standalone packaging checks pass. Browser checks cover need-level selection, mixed state, text/scope filtering, filtered bulk actions, hidden selection preservation on save/reopen, empty results, both workspaces and the isolated standalone release. No console warnings or errors were observed. See `verification-v2.0.4.json` and `outcome-picker-preview.png`. Direct local-file opening and native print/PDF layout retain the manual-check boundary noted above.


### Changed-input review removal — 2.0.5 verification

53 planner JavaScript, 14 planner Python and 65 learner JavaScript checks pass. Standalone browser checks confirm that shared teaching still updates audience coverage and time, edited plans finalise without selection reviews, and legacy saved review flags are ignored across import and reload. The learner bundle is rebuilt with the shared validation changes; learner target/scope review remains unchanged. No console warnings or errors were observed. See `verification-v2.0.5.json` and `review-removal-preview.png`.

### Release 2.0.7 verification

61 JavaScript and 14 Python checks pass. Coverage regression checks reconcile all component and audience counts, priority order, conditional must-have flags, internal dependencies, filtering and deduplication. Browser checks cover both workspaces, retained evidence/actions, filters and empty states, category and ID sorting, CSV completeness, the unfiltered print DOM, and the isolated standalone release. Internal teaching moves an outcome to the internal-dependent bucket while assessed coverage stays unchanged. The 390px layout has no horizontal page overflow and stacks expanded evidence. No standalone console warnings or errors were observed. See `verification-v2.0.7.json` and `coverage-explorer-preview.jpg`. Direct file opening and native print/PDF layout remain manual checks.


### Release 2.0.8 verification

67 JavaScript checks and 14 Python checks pass, including six course-detail regressions for explicit zero/unassessed evidence, scope completeness, shared-course deduplication, hour overrides, unresolved budgets, provenance and escaped catalogue text. Browser checks verify the shared details in both workspaces, current-scope/all-outcome switching, expanded prompt-injection evidence, preview and duration actions, and the 390px layout without horizontal detail overflow. The rebuilt single-file release was checked from an isolated local server with no browser warnings or errors. See `verification-v2.0.8.json` and `course-details-preview.jpg`. Direct local-file opening remains a manual work-machine check.
