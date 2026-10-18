# AI era cyber training planner project context

Last updated: 17 October 2026. This is the local project handover and record of the user's agreed scope. The working app and operational instructions are in [training-planner/README.md](training-planner/README.md).

## Purpose and business context

Prepare the company's cybersecurity workforce for an agentic AI operating model. The target organisation includes L1 people who primarily perform work themselves with AI assistance, L2 people who supervise agents, and L3 people who build and evaluate agents, including no-code/low-code builders. Role specialisms, including security, governance, leadership and IAM, are independent of agentic level. The training layers support that transition; they are not a claim that everyone needs every layer or specialist branch.

The user first defined granular roles and capability needs, collected internal and external learning resources, and used AI to assess those resources against the needs. The task is to turn that assessment into coherent, realistic training plans. Training must fit around people's day jobs, so learner time matters more than assembling a long list of courses.

Functional heads need flexibility and a clear explanation of why courses are selected or omitted. The app should make an initial proposal, expose its evidence and tradeoffs, retain access to the full catalogue, and let heads adapt applicability and selections with a recorded rationale. 

The agreed approach is to optimise course combinations for coverage under editable time budgets, show what remains uncovered, and distinguish gaps that another assessed resource can address from gaps needing internal development. Recommendations must come from the recorded assessments or new research which then needs to be explained and validated.

## Source material and authority

- [Agentic-Era_Workforce_Capability_Model.md](Agentic-Era_Workforce_Capability_Model.md): This is the authoritative source for the description of the model, all the other artifacts needs to stay coherent to this. Any discrepancy should be flagged for review and correction proposed.
- [AI_Era_Cyber_Training_Catalogue_v9.xlsx](AI_Era_Cyber_Training_Catalogue_v9.xlsx): current course catalogue, scoring and evidence. V7 and V8 are preserved unchanged. V9 removes TR-127 (the CERT-FR personal-assistant risk bulletin) at the user's request as outside the corporate training scope; all surviving scores are unchanged.
- Import the workbook's Offers, Tool track, Needs, Rubric, Scores, Scoring guide and Build items sheets. Preserve stable IDs, evidence notes, original duration text, links and sheet/row references.
- Do not use the outdated Matrix as the curriculum authority. Preserve the source workbook and assessment evidence unchanged. The capability model is now v2; its original is preserved in model-history/.
- Current imported v9 snapshot: 424 resources (307 Offers and 117 Tool track entries); 140 active requirements; 42,700 numeric scores and 280 explicitly unassessed rows. Snapshot version: `a959067fd5d91eba`; surviving assessments dated 15 October 2026, scope revision dated 16 October 2026, role-number labels updated 18 October 2026. TR-017 and TR-045 remain unassessed. Snapshot identity includes imported content/schema; sourceSha256 separately identifies workbook bytes.
- Unassessed resources remain visible. Tool-track metadata must not be turned into invented requirement scores.

## Current capability model — 17 October 2026

**Foundation + agentic level + relevant role specialisms + tool training** replaces the earlier single level ladder. Foundation is not a fourth level; operational authorisation remains separate. A role can apply at any L1–L3 level, with professional prerequisites checked independently. The revised source document starts with a one-page explanation, then retains all detailed outcomes and a full crosswalk.

- Foundation: 29 foundation outcomes in N1–N5, excluding N4.7 and N5.7.
- L1: N6 (8 additional outcomes).
- L2: N7–N9 plus N4.7 (16 additional outcomes).
- L3: N10–N11 except N10.3/N10.6/N10.7 (11 additional outcomes). N10.8 keeps safe deployment in common builder learning.
- Roles: N12–N14, R-coded needs, N10.3/N10.6/N10.7 agent infrastructure learning within Security architecture & engineering, and N5.7 AI threat tracking within Threat intelligence & detection. N11.4/N11.6 are also available for vendor evaluation without forcing L3. Specialist depth is attached to the responsibility rather than the agentic level.
- Tools: named on profiles and linked to product-specific practice; no inferred assessment scores.

`training-planner/public/capability-model.js` owns names and applicability. `scripts/build_capability_model.mjs` generates the main model document, `Capability_Model_Crosswalk.csv` and `public/data/capability-crosswalk.json`. The 140 original outcomes, 23 scored need groups and all source evidence remain unchanged. Source level/rank metadata is historical; the overlay controls new profile applicability. Do not merge scored need groups to simplify the presentation: that changes equal-need weighting.

New schema-2 scenarios have an independent agentic level, role specialisms and tool list per cohort. They include 23 editable examples: GRC L2/L3, leadership L1, IAM L1, and other relevant responsibilities. No single function implies one profile. Foundation and L1 provisionally split the former 4h budget into 2h + 2h; L2 adds 8h, L3 24h and role cohorts 4h. These editable budgets exclude internal practice. Starter selections have been freshly optimised; approved tool choices still require functional-head input.

Shared learning can be inherited from shared cohorts at or below the target level. Outcomes, courses and internal commitments are deduplicated. Changes to planning inputs mark affected recommendations for review; changed shared selections also mark descendants. Advanced source-labelled courses are eligible for an independently selected role when recorded teaching scores at least 2 on an applicable specialist outcome. Review real prerequisites separately.

Existing schema-1 scenarios, imports and duplicates retain their original calculations and display a previous-model notice. They are not silently converted. New profiles use a new scenario. Source workbook sheets retain their historical names, including Tool track. The 2027 report is explicitly marked as a previous-model reference; its annual plan has not been reinterpreted under v2.

Older sections below record the original implementation and historical 2027 planning decisions. This section supersedes their level/pathway interpretation and their initial cohort/budget defaults.

## Required user experience

The app has five views: a Capability model explainer and the four planning views below:

1. **Plan overview:** shared layers and six functions, selected resources, coverage, critical gaps, incremental course/internal hours and cumulative learner time. Presentation mode hides editing controls.
2. **Cohort planner:** editable budget and applicability, inherited learning, recommendation generation, manual add/remove, pin and exclude; standalone and additional coverage rankings; previews before changing selections. Generating a proposal leaves the current selection unchanged until the planner applies it.
3. **Coverage and gaps:** need percentages and bands, expandable requirement-level scores and evidence, current selection versus catalogue ceiling, and planned internal work. Gaps lead to supplementary resources or internal-item creation.
4. **Catalogue and course details:** search and filters for audience, need, provider, duration, type, tool dependency and assessment status; descriptions, evidence quality, limitations, source references and separately labelled internal/public links. Provider links open in a new tab.

Explain eligibility and decisions: selected, overlapping, over budget, excluded, unsuitable under current filters, uncertain duration or insufficient assessment. Inherited courses are counted once. Course additions should preview changes to coverage, critical gaps and hours.

## Coverage and recommendation rules

- Each applicable requirement takes the highest recorded score across selected courses, on a 0–3 scale. Overlapping courses receive no duplicate credit.
- A missing assessment contributes zero to calculations but remains visibly **unassessed**, distinct from an explicit zero score.
- Need coverage is the sum of scores divided by three times its applicable requirement count. Overall cohort coverage is the mean of need percentages, giving each need equal weight.
- Retain the workbook's Full/Strong/Partial/Weak rules and critical flags. A critical gap in the current implementation is a must-have requirement at zero; all scores below three remain completion gaps.
- Use locally bundled HiGHS WebAssembly in a Web Worker to maximise coverage within the remaining layer course-hours budget, conditional on inherited learning, pins and current filters. Tie-break by fewer hours, then fewer courses.
- Default automatic eligibility includes assessed learning resources suitable for the audience with usable durations, including readings and labs. Exclude exam-only/certification-only records, practice tests, unavailable offerings and unassessed entries. Keep them visible for manual consideration.
- Pinned courses remain compulsory; explain budget conflicts without silently dropping them. Manual selections may exceed filters or budget, with visible warnings.
- Limit solving to 15 seconds across optimisation phases. Claim optimality only when proven; otherwise show the feasible result and solver gap if available. The bundled solver interface does not expose a MIP gap, so the app reports it unavailable. A 20-second worker watchdog covers startup and protects the UI.
- Optimisation is per cohort, conditional on inherited choices, not a global optimum across the organisation. Changes to shared selections update descendant coverage/time; downstream recommendations should then be rerun.

## Gap and time rules

For requirements below score three, classify:

1. **Can be completed through another assessed resource:** an assessed catalogue resource reaches three.
2. **Can be improved, but needs internal completion:** a resource improves the current score but the catalogue ceiling remains below three.
3. **Internal completion needed:** the selection already reaches the assessed catalogue ceiling, which is below three.
4. **No assessed teaching found:** the catalogue maximum is zero or one; distinguish no evidenced coverage from mention-only coverage.

Show whether improving resources fall outside current filters or the available budget. Unassessed resources are uncertainty. Use “not evidenced in this catalogue”, not “no training exists”.

Preserve original duration text. Use explicit learning hours and the upper bound of bounded ranges. Do not convert exam time, lab-access periods or unexplained days/modules into course hours. Ambiguous durations require a labelled planner estimate before automatic selection. Use full-course duration and assessed coverage; an excerpt must not inherit the full course's score. Manual selections with unknown duration show known hours plus the unresolved-item count.

## Internal work and scenarios

Internal items have a title, owner, hours, linked requirements, intended outcomes and status. Existing Build items can seed them. They increase learner commitment but do not automatically increase assessed course coverage or close an evidence gap.

Named scenarios support browser autosave, duplication and side-by-side comparison. Draft, Reviewed and Finalised are planning statuses, not learner sign-offs. Finalised scenarios are edited through a new draft copy.

JSON exports are reloadable. Course-plan and gap-register CSV exports support review; a print layout supports browser PDF output. Exports include assumptions, applicability decisions, selected courses/links, time totals, evidence gaps and internal commitments. Import checks catalogue versions and flags unresolved IDs without silently discarding them.

Scenario decisions live in browser localStorage, not automatically as project files. Use JSON exports to back up or transfer them. A finalised scenario is not a frozen copy of the entire catalogue; retain the matching catalogue snapshot for historical reconstruction.

## Implementation and operation

The app is in `training-planner/`. It is buildless HTML, CSS and JavaScript, with local solver assets and no runtime CDN dependency. The Python standard-library launcher (`python server.py`) serves `http://127.0.0.1:4173` on the local machine only. There is no hosted publication, cloud storage, account system, telemetry or live collaboration. Data and solver operations stay local; provider navigation occurs when a user opens a course link.

Key files:

- `training-planner/public/app.js`, `index.html`, `styles.css`: views, interactions and presentation/print layout.
- `public/cohorts.js`, `scoring.js`, `duration.js`: scope/inheritance, evidence calculations and planning time.
- `public/optimisation.js`, `solver-worker.js`, `vendor/`: optimisation model and bundled HiGHS 1.14.2 assets/license.
- `public/storage.js`: scenario persistence, validation and import/export.
- `public/data/catalogue.json`: traceable source snapshot; `default-scenario.json`: seeded editable proposal.
- `scripts/refresh_catalogue.py`: validated read-only workbook import, change report, archived snapshots, atomic publication and rollback. `import_catalogue.py` is a compatibility entry point; pass a workbook explicitly.
- `scripts/catalogue_io.py`: schema validation, unassessed handling, audit import and coverage reconciliation.
- `catalogue-history/`: archived JSON snapshots and change reports, outside the served public folder.
- `scripts/verify_workbook.py`: independent source reconciliation.
- `scripts/seed.mjs`: regenerate default selections; does not overwrite browser scenarios.
- `tests/core.test.mjs`: calculation and optimisation checks.
- `server.py`: Python local static server; `server.mjs` remains optional for developers. `README.md`: work-machine setup, restart, refresh, rollback and testing commands.

The user wants easy distribution as a single HTML, with Python only when synchronising Excel. Optional model maintenance and starter recomputation use Node on this development machine; recipients still need only the HTML. `training-planner/Training-Planner.html` now embeds the complete catalogue, default scenario, styles, application modules and HiGHS WASM solver. `scripts/build_standalone.py --workbook WORKBOOK.xlsx` runs the existing validated refresh and creates the distributable. Without `--workbook`, it packages the current snapshot using only Python's standard library. Full optimisation is preserved in a Blob Web Worker with embedded WASM; no runtime fetches or companion files are needed. The original `public/index.html` remains a local-server entry point.

## Verification completed and remaining work

During implementation, 13 automated tests passed and 772 course/need results and critical-gap counts were independently reconciled against the workbook. Tests covered per-requirement maxima, equal-need weighting, scope and inheritance, deduplicated hours, gap classifications, duration ambiguity/overrides, internal-work separation, scenario round trips/version warnings, eligibility, optimiser agreement with exhaustive enumeration, pins, infeasibility and timeouts. The regression case INT-397 plus INT-1840 yields no additional N13 coverage beyond INT-397 alone.

Browser checks covered recommendation generation and review/apply, manual changes, cohort switching, evidence drill-down, provider-link navigation, internal-item time accounting, persistence after reload, scenario comparison, JSON export/import, CSV contents, finalised locking and presentation mode. Browser console had no errors at the last check. The print DOM contained all 17 cohort sections, but native PDF output has not been visually verified; this remains the stated acceptance limitation.

The shipped seed has a 4-hour All users budget and selects 3 resources totalling about 3.72 hours, with 43.9% assessed coverage and 3 critical gaps. The implementation browser also contained an 8-hour foundation alternative achieving 59.4% coverage at about 7.63 hours with no critical gaps, plus an imported finalised copy used to verify locking. These browser-local scenarios are not guaranteed to exist in another browser/profile. The alternative's downstream selections were not re-optimised; its assumptions explicitly say to review them before adoption.

The initial optimiser can select non-cyber resources whose transferable content scores well against the rubric. This is an expected consequence of the agreed objective, not a course endorsement. Functional heads should review suitability notes, prerequisites and evidence quality. Do not silently change recorded scores to produce a more appealing shortlist.

The next workshop step is to review applicability and the proposed combinations with functional heads, choose realistic budgets, and assign owners and hours to internal completion work. Operational instructions are already on disk in the linked README. No server process should be assumed to remain running across sessions; use the restart instructions when needed.

## Python-only deployment and refresh — 15 October 2026

The user has Python but no Node.js on the work machine. Runtime and refresh therefore require no Node/npm: run `python server.py`; install `openpyxl` from `requirements.txt` only when refreshing Excel. Copy the entire `training-planner/public` tree, including local solver assets. Use Python 3.9+ (`py` or `python3` if that is the machine's command).

From `training-planner`, refresh using `python scripts/refresh_catalogue.py ../AI_Era_Cyber_Training_Catalogue_v8.xlsx`; add `--check` for a non-publishing validation. Repeat refreshes are idempotent. Use `--rollback VERSION_HASH` to restore an archived catalogue, then reload the browser. No server restart is needed. Original Excel files, browser scenarios and default proposal selections are not modified. Workbook formula caches must be current; the importer rejects inconsistencies rather than silently importing them.

V8 has been published and independently reconciled across all 7,084 Coverage rows. The browser shows the 15 October assessment date, preserves all three existing scenarios and displays its expected catalogue-version warning. New source audit and previous-score metadata are available in course details. Need filtering now requires positive evidence, so the new explicit zero rows do not cause every course to match every need.

Verification: 9 Python tests cover v8 import, zero/unassessed separation, schema failures, stale formula caches, check/publish/repeat/rollback, atomic write failure, concurrent refresh locks and local HTTP asset/security behaviour. Existing scoring and optimiser checks also pass; a need-filter regression was added. Node is used only for optional developer tests and seed generation.

Archived catalogue files support rollback, but finalised scenarios are still locked planning decisions, not automatically bound to historical catalogue data. This limitation is documented in README; retain PDF/CSV exports and scenario JSON for an approved historical record.


## Single-file distribution — 15 October 2026

The primary recipient workflow is to save and open `training-planner/Training-Planner.html`. No Python or Node is needed by recipients. Maintainers run `python scripts/build_standalone.py --workbook ../AI_Era_Cyber_Training_Catalogue_v8.xlsx` from `training-planner` to validate, archive and synchronise Excel, then regenerate the HTML. The output is about 23.4 MiB; only that HTML needs to be distributed. Instructions and the optional Python server workflow are in README.

Runtime adapters load embedded data and create a Blob worker when payloads are present; server mode retains local asset loading. Bundled WASM is passed as bytes to HiGHS, and the standalone content-security policy blocks network connections. The Python module packager preserves isolated module scopes, embeds CSS imports, escapes script payloads and retains the solver license. Unsupported bundling syntax fails explicitly. HTML publication is atomic; a packaging failure leaves the previous HTML intact, although a preceding successful Excel refresh already updates the server snapshot.

Planning decisions remain separate from the HTML. Export scenario JSON before transferring, replacing or renaming files, and import it into the new copy. Local-file autosave varies by browser and location; localhost autosaves do not automatically migrate. Sharing HTML distributes the catalogue and default proposal, not browser-local scenarios. Company restrictions on local scripts/workers/WASM may require the optional server workflow or IT support.

Verification: 13 Python tests and 14 JavaScript calculation/optimisation tests pass. The combined workbook-to-HTML command reconciled all 7,084 Coverage rows and was idempotent against v8. Browser verification served only the single HTML on a temporary localhost address: catalogue rendering, embedded HiGHS recommendation, JSON export/import, imported-scenario persistence after reload and presentation mode succeeded, with no console warnings/errors. No companion assets were available and the CSP blocks network connections. Direct `file://` navigation could not be automated because the browser testing tool blocks that protocol; opening the distribution directly on the work machine remains a manual acceptance check. Local-file storage behavior was therefore not browser-tested.

## Catalogue and earlier 2027 plan revision — 16 October 2026

The user explicitly excluded TR-127 (CERTFR-2026-ACT-016) because personal-assistant workstation risks, such as OpenClaw, are unnecessary for this corporate programme. Do not reintroduce it as a curriculum shortcut. The current workbook is `AI_Era_Cyber_Training_Catalogue_v9.xlsx`; v8 remains historical. V9 removes the Offer, its 140 Scores rows, 23 Coverage rows and active V8-audit entry, recording the decision in Screening log. All surviving course values, formulas, scores and need definitions are unchanged; dependent summary counts were recalculated. Current app catalogue version is `a959067fd5d91eba` after the role-label revision: 424 resources (307 Offers + 117 Tool track), 42,700 numeric assessments, 280 explicitly unassessed rows and 7,061 reconciled Coverage rows. The standalone HTML and app default are regenerated; browser-local scenarios are not overwritten.

The 2027 comparison at `analysis/2027-training-plan/2027-Training-Plan.html` now has three active options. Option 1 was re-optimised (foundation 44.1%; Practitioner 51.7%; technical Expert 62.7%; governance Expert 62.8%). Recommend Option 2 for quality and distinct learning outcomes: foundation 31.4%, Practitioner 48.3%, technical 57.7%, governance 60.0%; cumulative learner commitments including internal work 6.8h, 17.3h, 44.3h and 38.8h respectively, leadership 20.3h. The old Option 4 is withdrawn, as removing TR-127 makes it identical to Option 2. Do not pretend a planned internal module closes assessed gaps. Its 3h foundation must teach the actual approved corporate-agent architecture, permissions, data boundaries, use cases and safety controls. Previous analysis files are archived in `analysis/2027-training-plan/archive/v8-before-TR-127-removal/`. The pack contains three reloadable scenarios, five CSVs and the portable report.

Validation of the v9 scope revision: all 347,742 cached formula results match an independent LibreOffice recalculation from an uncached temporary workbook, with no formula errors. The original-format v9 file is retained. All 51 plan-cohort calculations independently reconcile; all 17 score-only solves are optimal within their individual constraints.


## Previous-model 2027 global curriculum — 16 October 2026

The user requires a self-standing report, without iteration narrative or headings about removals. The global recommendation excludes the Singapore CSA note TR-129. The global scenarios and regenerated generic app default also exclude its companion TR-128 and the French-language national guidance TR-125. These resources remain in catalogue v9 for scoped local use; no workbook scores or source bytes changed. Global technical frameworks (including NIST AI RMF, OWASP and Cloud Security Alliance) can remain references; local regulatory supplements need relevant audiences and separate budgets.

The active report now has four options and recommends Option 4, Quality core and in-house capability, conditional on content-owner and build capacity. It develops Option 2 with a 90-minute N1 colleague-use-case showcase, an approved-platform walkthrough and safe-use check (4h internal foundation in total), four 2h Practitioner modules, and concrete Expert/leadership designs. N14 workflow studios replace INT-2478 in Option 4. Internal plans remain unassessed and earn no points. Real bank case studies have not been supplied: candidate briefs must be filled by functional heads, clearly distinguishing production, restricted pilots and horizon capabilities.

Option 4 cumulative learner hours: all staff 7.8h; Practitioner 18.3h; Technical Expert 43.5h; Governance Expert 38.0h; Leadership 19.5h, before role specialties. Assessed layer coverage respectively: 31.4%, 18.3%, 43.2%, 50.0%, 44.2%. These are course-evidence scores, not target internal outcomes. Report tables show incomplete requirements linked to planned internal work and those still unlinked. The design portfolio contains 15 shared/pathway module briefs; nobody is assigned all 15. Specialist internal practice remains 4h per applicable branch. Build effort and delivery capacity are separate from learner time.

Canonical report: analysis/2027-training-plan/2027-Training-Plan.html. The ZIP contains the report, four reloadable scenario JSONs, seven CSVs and verification. Report sources are build_report.py, report_template.html, report_ui.js and report_styles.css. options.json owns the curriculum configuration; in-house-design.json owns the module design briefs. The repeatable reassessment is analyse.mjs, variants.mjs, verify_analysis.py, then build_report.py. revise_global_plan.py can reproduce the current design from the archived baseline but should not be rerun after intentional manual configuration edits without review. Previous files are archived in archive/before-global-in-house-option/. All 68 cohort calculations independently reconcile and all four scenarios roundtrip with no unresolved IDs.

## Capability model v2 verification — 17 October 2026

Implementation completed: revised model with an opening explanation; complete 140-outcome CSV/JSON crosswalk; independent level/role/tool profiles in the planner; 23 freshly calculated starter cohorts; versioned imports and prior-model notices; review invalidation; profile-aware exports; regenerated standalone HTML. Original model and starter copies are retained. Workbook and catalogue bytes are unchanged.

Validation: 26 JavaScript and 13 Python checks passed. The previous annual report's 68 cohort calculations still reconcile. Browser checks covered level/role independence, profile changes, the solver, persistence, tool browsing and exports. The standalone HTML's embedded solver was tested with no companion files and no console errors. Direct local-file opening/autosave and native print layout remain manual work-machine checks. A clearly named Model v2 validation draft was added to the development browser; earlier saved scenarios were retained.

Editorial follow-up: the opening now has dedicated role-specialism and tool-training explanations with examples, followed by **From the model to learning needs** and **From target work to a training plan**. The needs introduction distinguishes topics from assessable outcomes, uses a GRC L2 example and explains target needs versus measured gaps. Both the generated Markdown and the planner's model view follow this sequence. Edit both the generator prose and `modelView()` when maintaining the explanation. No applicability, scoring or starter-plan changes were needed for this follow-up.

Further refinement: the opening role section now lists the nine existing roles and their original ECSF mapping, including Leadership and IAM, rather than illustrative specialisms. Tool training teaches a specific product or in-house tool and follows access, distribution and intended work. Examples include Microsoft Copilot Cowork, Anthropic Claude Code, defender tools, Claude Code Security and application-security harness operation versus L3 harness construction and evaluation. `public/model-explanation.js` is shared editorial metadata for these tables and all 23 need classifications: generic N2–N4, N6–N11 and N13–N14; cyber-specific N1, N5, N12 and all nine R-coded needs. Classifications follow the primary learning objective, independently of audience: generic does not mean for everyone; cyber-specific awareness can have a broad audience. N0 core craft remains outside the assessed needs. Each detailed need displays its category and rationale. The source outcome text, applicability, crosswalk, course assessments and starter plan are preserved.

18 October clarification: N10.3/N10.6/N10.7 are agent infrastructure learning needs within Security architecture & engineering, rather than a separately presented Agent platform engineering specialism. The visible package and starter cohort now carry the parent role name. The internal `agent-engineering` key remains for saved-plan compatibility; its outcomes, applicability, scores, selected courses and budget are unchanged. Select these outcomes only for people with infrastructure responsibilities; they do not become mandatory for every architect or L3 builder. The model reference tables explicitly describe packages as role learning needs.

The same presentation rule applies to N5.7: AI threat tracking is a learning need within Threat intelligence & detection. It no longer appears as a separate component in the model-to-needs mapping. The visible package and starter cohort use the parent role name; the internal `threat-intelligence` key, N5 scoring group, applicability and planning calculations remain unchanged. N5.1–N5.6 remain shared foundation awareness, while N5.7 provides role-specific threat tracking and control adjustment.

18 October role-order change: role 8 is IAM and role 9 is Leadership (CISO). The document and planner share this ordering through ROLE_FAMILIES. Preserve the user’s two-column opening role table, plain product names and shortened Security architecture & engineering label in the role-needs reference; these edits are now reflected in the generator. Assessment IDs stay stable (R9.1 for IAM; historical M-R8.x/R8.x for leadership). The workbook edits are Needs!D24, Matrix!B38:B41 and README!A92:D92 (numbering note). All other native workbook parts, formula text, cached results, scores and styles were preserved; the 7,061 coverage rows reconcile. Workbook SHA-256 is `6a111b7f364de4de3012a965eb73688eb078d5a41a2a87696ce8da3e3052cdd8`. The fresh snapshot is `a959067fd5d91eba`; starter catalogue metadata is updated without changing selections. See `.catalogue-v9/role-numbering-20261018.json` for the cell audit. Historical model versions and the v8 delivery ZIP remain historical. The PPTX has no numbered role labels, only stable assessment IDs, so requires no edits.
