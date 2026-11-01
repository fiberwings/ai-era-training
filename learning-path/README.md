# My AI Learning Path

A learner-facing companion to the training builder. **Open `index.html`** in a current desktop browser, or host that single file on GitHub Pages. No installation, external scripts, fonts, API keys, or server are needed for the application itself. Course websites and Microsoft Forms require internet access.

Release **1.3.1 — 31 October 2026**. Uses the same v12 catalog (528 offerings), model v2 revision 3, and central selections from the current builder’s 23 planning presets. The bundled central 2027 pathway is explicitly labelled **Draft**. Proposed internal learning is visible as upcoming; it cannot be committed or completed until marked Ready in a new central plan.

Catalogue v12 (31 October 2026) reassesses two Anthropic courses using public lessons and exercises. TR-145 is a 3.5h Foundation AI-limitations course with L1 practice (N3 76%, N6 54%). TR-089 is a 4h L1 AI-fluency course with supporting Foundation content (N6 67%); its four core N6 outcomes have full teaching and practice. These aggregate bands remain Partial. Other courses and the 140-outcome rubric are unchanged. Previous static analyses retain their original catalogue snapshots. Learner release 1.3.1 embeds this update.

## Learner experience

- **For you:** four visible layers — Foundation, one confirmed L1/L2/L3 level, one or more of the model’s nine roles with selected responsibilities, and one or more tools. Each layer has its own central recommendations, tailored options, and relevant catalog search. Foundation is always included; earlier-level practice sits within the chosen level layer.
- **Onboarding:** expected work sets the target L1/L2/L3 level. Four practical checks suggest a separate starting point and learning sequence without lowering target outcomes. The learner confirms the work target, then selects roles, relevant responsibilities, tools and intended tasks (use, supervise, build, administer). Applicable activity questions explicitly ask about automated judges and AI-assisted assurance. The full four-layer composition is shown before saving.
- **Explore training:** full-text search, topic/tool/provider search, track/provider/type filters, short-course and relevance filters, bookmarking, and comparisons of up to three offerings.
- **My learning:** personal commitments, ordering, target dates, notes, actual time, planned/in-progress/completed/deferred states, CSV export, and printing.
- **My profile:** four numbered, editable layers; Foundation is fixed, level is a single choice, roles and tools are independent multi-selects. Each selected role requires at least one responsibility except Security awareness & culture, which reuses shared AI-risk learning and tool training. Selecting a role never automatically selects all its packages. Pace, starting-point review, JSON backup/restore, and saved feedback remain available.
- **Learning coverage:** a collapsed side panel showing Foundation, L1/L2/L3, selected roles, and tooling. Shared outcomes count once overall. Switch between central, selected, and completed-course coverage. Need tiles show supporting evidence and link to relevant offerings.

Recommendation source and personal status are independent. Other-level specialist selections are labelled “Central role option,” name their original plan and level, and prompt a prerequisite check. They are unchecked by default in bulk review. A centrally recommended course stays labelled “Centrally recommended” after it is added to a learner's plan. Unselected offerings say “From the catalog”; personal additions say “Added by you.” Saved-for-later and deferred courses do not count as committed coverage. Existing learning remains when the profile or published pathway changes. A course may support more than one layer, but its commitment and learning time are counted once.

## Save and transfer progress

Progress is stored in browser `localStorage`, under a separate namespace from the training builder. It is specific to the browser, profile, and origin. Local-file storage depends on browser policy and file location. Keep a JSON backup before clearing browser data, moving/renaming the HTML file, changing devices, or moving between local-file and hosted use.

**My profile → Download backup** includes the learner's profile, choices, dates, notes, feedback, and local Forms configuration. **Restore backup** validates the file and asks before replacing the current plan. Archived course records stay in the backup and plan. The app shows storage failures and update warnings; it does not silently reset an unreadable backup.

There are no accounts, background uploads, cross-device sync, automatic enrolment, or external AI calls. Completion and submission confirmations are self-reported.

### Existing saved profiles

Release 1.3.0 stores the target level separately from starting-point guidance, per-tool tasks, a saved central outcome-scope snapshot, role IDs and per-role responsibility choices (`pathVersion:4`), with the original flat `specialisms` package list derived for compatibility. Older group-based profiles and 1.1/1.2 layered profiles are migrated on opening or restoration. Unambiguous packages preselect their model role. Shared governance/vendor packages stay in a visible “Previous responsibilities” section, retaining their full learning scope until the learner places them under Governance, Leadership, or both. Applicable activity questions require an explicit Yes/No; source-plan flags never supply the answer.

Existing confirmed levels are retained. If an older quiz lowered the level below the saved work goal, the app asks the learner to review their target instead of silently raising it. Tool tasks are left unanswered until the learner selects them. Effective central outcome additions/removals from the original assigned profile are captured during migration. A Foundation-only legacy profile starts at L1 with Foundation retained. Incomplete profiles receive setup prompts rather than invented selections. Course commitments, order, target dates, notes, completion context, ratings, original feedback context, and Forms settings are preserved. Changing layers never deletes existing learning.

### Authoritative roles and responsibility packages

The nine role names/order come directly from `training-planner/public/model-explanation.js`. Its `ROLE_RESPONSIBILITIES` mapping preserves all 17 existing package identifiers and assessed outcomes:

| Role | Responsibilities |
| --- | --- |
| 1. Security operations & response | Incident response; forensics and evidence |
| 2. Threat intelligence & detection | AI threat tracking and control adjustment |
| 3. Offensive security & testing | Agent testing and containment; advanced red-teaming |
| 4. Vulnerability & exposure management | Exposure management; code-analysis engineering and application-security harnesses |
| 5. Security architecture & engineering | AI security design/remediation; agent security architecture; infrastructure |
| 6. Governance, risk, compliance & assurance | Governance/risk; assurance; vendor evaluation |
| 7. Security awareness & culture | Reused shared AI-risk learning and tool training; no separate package |
| 8. Identity & access management (IAM) | Identity operations; identity integration/design |
| 9. Leadership | Leadership/accountability; workflow transformation/adoption; vendor evaluation; relevant broader governance |

Shared responsibilities can be selected under both relevant roles. Outcomes, plan entries, course hours, and overall coverage remain deduplicated.

## Build the single-file release

Node.js 20+ is sufficient; no npm dependencies need installing. From this directory:

```sh
npm run build
npm test
python3 -m unittest discover -s tests -p 'test_*.py'
```

The build reads `../training-planner/public/data/catalogue.json` and `default-scenario.json`, bundles shared applicability/scoring/duration modules, and writes `index.html` atomically. Every numeric outcome score and its evidence note is retained. Repeated evidence strings are interned to keep the artifact around 2.9 MiB; audit history remains in the authoritative catalog. The build is deterministic with unchanged inputs.

To publish a different current-model pathway or Forms configuration:

```sh
node scripts/build.mjs \
  --scenario /absolute/path/to/exported-scenario.json \
  --config /absolute/path/to/learning-path-config.json
```

Optionally include an administrator-reviewed feedback aggregate:

```sh
node scripts/build.mjs --feedback /absolute/path/to/reviewed-learning-feedback.json
```

`--output /absolute/path/to/index.html` selects another destination. Legacy model scenarios, stale catalog versions, unresolved references, and review flags are rejected rather than silently reinterpreted. Drafts may be previewed and are labelled as drafts. Review/finalise the source pathway in the builder before organisational rollout. Update `config.json` release version/date for a new distribution.

The **Administration → Import central plan JSON** tool previews a validated scenario locally. It does not publish or edit the source file. A local override is clearly identified and can be replaced with the bundled plan. Publish the same scenario with the build command for other learners.

## Host on GitHub Pages

The distribution artifact is `learning-path/index.html`; it does not depend on neighbouring files.

1. Place this file in a GitHub Pages publishing source. For a separate site/repository, put it at the root as `index.html`.
2. Configure that repository's Pages publishing branch/folder or existing deployment workflow.
3. If this repository is published from its root, the app is available at `https://OWNER.github.io/REPOSITORY/learning-path/`.
4. Keep the same URL for releases so browser-local progress remains available. Replace the HTML with a newly built version; existing personal plans are not embedded in the distributed file.

The compiled file contains the catalog's internal learning links and central pathway. Use the organisation's intended publishing audience. Personal learner records and raw feedback are never included by the build.

This implementation does not change repository hosting settings or publish a site. See [GitHub's Pages guide](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site) for the hosting controls.

For a local HTTP preview:

```sh
npm start
```

Open `http://127.0.0.1:4174/`. Stop the server with Ctrl+C. Direct file opening remains supported.

## Connect Microsoft Forms later

The shipped app has **no form configured**, as requested. Feedback can be saved locally and exported while the connection is being prepared.

Create **one form for all courses**. Use Text questions with the exact question titles below; optional fields should not be required. The form is the final submission screen, not the primary feedback-entry UI.

| Question title | Answer to enter when generating the prefilled link |
| --- | --- |
| `COURSE_ID` | `{{COURSE_ID}}` |
| `COURSE_TITLE` | `{{COURSE_TITLE}}` |
| `GROUP_ID` | `{{GROUP_ID}}` |
| `GROUP_NAME` | `{{GROUP_NAME}}` |
| `CATALOGUE_VERSION` | `{{CATALOGUE_VERSION}}` |
| `COMPLETED_ON` | `{{COMPLETED_ON}}` |
| `USEFULNESS` | `{{USEFULNESS}}` |
| `DIFFICULTY` | `{{DIFFICULTY}}` |
| `ACTUAL_HOURS` (optional) | `{{ACTUAL_HOURS}}` |
| `COMMENT` (optional) | `{{COMMENT}}` |
| `RESPONSE_ID` | `{{RESPONSE_ID}}` |

In Forms, use **Get pre-filled URL**, enter these placeholder strings, and copy the full generated link. Paste it into **Administration → Microsoft Forms connection**. The app checks the host and all placeholders. Use **Test prefilled link** to inspect a sample without sending it. Then save the connection locally or export a publishing configuration and rebuild to distribute it.

Allow multiple responses: one employee needs to review multiple courses. Choose your organisation's sign-in/name-recording settings. The app does not ask learners to retype their name or email. Do not branch around prefilled questions. Use the full URL rather than a shortened link.

For new completions, the group metadata identifies the confirmed level and selected role names. Older completion and feedback contexts remain unchanged.

The learner flow is **mark complete → rate in the app → open prefilled Forms → review and Submit**. All known metadata and entered feedback are prefilled. Fields remain visible and editable in Forms. The app cannot verify a cross-origin form submission and never treats opening the form as successful delivery. “I submitted the form” records the learner's confirmation. Long optional comments are limited to keep links manageable.

Microsoft documents [prefilled Forms links](https://techcommunity.microsoft.com/blog/microsoftformsblog/pre-fill-responses-in-your-microsoft-forms/4144232). The template and encoding are tested locally; a real tenant integration still needs the actual form and sign-in policy to be validated.

## Central feedback review

Responses are collected centrally in Forms. The first release uses an administrator export/review/republication cycle, with no backend or automatic central polling.

For CSV: export/save the Forms response workbook as **UTF-8 CSV** and import it in **Administration → Review learner feedback**. Preserve the exact question titles above. Extra Microsoft identity/timestamp columns are ignored; only the eleven documented response fields are imported.

For native Excel exports, the included Python standard-library converter reads `.xlsx` without modifying it:

```sh
python3 scripts/import_feedback.py /absolute/path/to/forms-responses.xlsx \
  --output /absolute/path/to/feedback.json
```

Import the resulting JSON into the administrator view. Learner-exported feedback JSON is accepted too. Importing an existing response ID replaces that response, preventing duplicates from repeated exports. Course IDs are checked against the active catalog; editable form metadata should be reviewed for accuracy.

The review shows counts, usefulness, difficulty, median actual time versus estimated time, and comments, separated by learning group and catalog version. Small samples are labelled. Reviewed aggregate exports include only current-catalog course IDs, counts, and average usefulness; comments, group names, and respondent identifiers are excluded.

At least five responses are needed for a small, bounded usefulness adjustment to optional suggestion ranking. This cannot alter central assignments, learner commitments, or syllabus scores. Use the existing builder to revise central selections and publish a new scenario when the review warrants it.

Administration is a **local utility**, not a hidden authenticated backend. Imported response data stays in memory and is not uploaded or automatically persisted. Do not publish raw feedback files with the application.

## Recommendation and coverage rules

- Foundation uses the central Foundation selection. The chosen level combines shared practice up to that level (L2 includes L1; L3 includes L1/L2). Role recommendations are grouped by the responsibilities actually selected. Matching-level central selections are preferred; relevant specialist selections from other levels remain visible as “Central role option,” with the original source and a prerequisite reminder. Only courses/internal practice relevant to the selected package pass through this route; it never imports another plan’s higher-level shared curriculum. If no central selection matches, catalog-derived options are labelled personalised. Tool matching requires both the product and at least one selected task. Task fit is curated in `src/tool-audiences.js` from catalog v11 titles/descriptions; it is separate from assessed outcome scores. Offerings with unclear task fit remain searchable but are not tailored suggestions. Existing commitments are retained regardless of changed recommendation fit. Personal choices never write back to the source scenario.
- N11.3 is essential only when the learner explicitly answers Yes to using automated judges; R6.1.2 is essential only when they answer Yes to AI-assisted assurance. These questions appear when their corresponding outcomes apply. Roles and source-plan activity flags do not answer them.
- Personalised suggestions use recorded marginal teaching, selected tools, starting-point refreshers, and learning time. Long courses receive a time penalty; tool options are diversified. At L1–L3, additional work-specific teaching is weighted ahead of incidental Foundation coverage. This affects optional ranking only, not the shared assessment calculations. This is an explainable ranking, not an assertion of mathematical optimality.
- A separate optional Python/Git readiness preference gates suggestions with detected explicit coding prerequisite phrases. It does not determine agentic level: no-code builders can still be L3. Central assignments are retained with prerequisite notices, and the full catalog remains available. Always check the provider's actual requirements before enrolling.
- The shared builder eligibility rules apply to assessed suggestions, including unavailable/rejected/exam-only exclusions, audience rules, uncertain duration, and independent specialist teaching. Product-and-task-matched tool metadata is suggested separately and labelled unassessed; unknown tool-learning time remains unresolved.
- The assessment suggests where to begin using the target work level and four checks. A suggested L2 start requires the verification, responsible-use and supervision checks; L3 also requires the evaluation check. The target remains the learner’s confirmed work level. Central practice is sequenced from the suggested start, while all target-level requirements and central options stay available. Earlier practice carries its original central-step label. Optional shared-level suggestions use the starting point. This is learning guidance, not competence certification or operational authorisation; it does not certify prior learning or alter saved commitments.
- Coverage calls the existing scorer: each applicable outcome uses its maximum recorded score (0–3), and needs are equally weighted. Full is 100%; Strong is at least 70% with no essential outcome at zero; Partial is at least 30%; otherwise Weak. Unassessed records remain distinguishable from assessed zeros.
- Track rows show applicable outcomes for that track. Shared-level rows contain only shared curriculum; role-specific reuse of N11.4/N11.6 is labelled Specialist, so L1 vendor evaluation does not imply an L3 target. Search, course details and comparisons use the same context. A need can appear across tracks, while the overall need/outcome totals are deduplicated. Course completion, internal practice, and tool metadata do not invent assessment evidence.
- Proposed internal sessions can be saved but not committed. Ready internal sessions can be planned and timed, but still earn no assessed coverage.

### Central profile outcome choices

My profile has a collapsible **Central learning profile (optional)** section. Select it only when a learning team has assigned a specific profile. The app snapshots that profile’s effective additions/removals, including inherited customizations, and applies them to the learner’s target outcomes. Other matched recommendation sources do not contribute their scope overrides. Added outcomes outside the selected roles appear in a separate central-profile learning section; outcomes and courses remain deduplicated.

Importing or publishing a revised central plan does not silently change a saved snapshot. **Review outcome changes** shows the saved and current choices and lets the learner keep the saved scope or use the latest. Missing sources retain their saved choices. Scope changes are recorded in local history; courses, completion and feedback context remain intact. Choosing Standard model outcomes removes the assigned-profile overrides.

## Release verification

The 1.3.0 release passes 65 learner-app JavaScript tests, 3 feedback-converter tests, and the existing builder’s 28 tests. Checks cover exact catalog score/evidence parity; nine roles/all 17 packages; cross-level IAM, forensics, governance and infrastructure options; exclusion of unrelated shared curriculum; awareness-only paths; explicit conditional activities; shared-course/outcome deduplication; old-profile migration with unchanged commitments and feedback context; separate work target/starting point; product-and-task matching; custom central scope and reviewable revisions; and specialist-context labels.

Browser checks over local HTTP cover migration of a 1.2 profile with three existing learning items; novice L3 onboarding retaining the target and leading with L1 practice; use-versus-administration tool recommendations; central plan import, saved-scope retention and explicit acceptance; specialist search labels; and responsive desktop/mobile layouts. The generated single-file artifact includes all data/code without runtime imports. Direct `file:` preview remains a manual work-machine check because the automation browser blocks local-file access. Microsoft Forms stays configurable and disconnected; no real form submission is claimed.

## Source layout

`src/app.js` owns the interface and event handling. `src/layers.js` defines the path composition, central source matching, legacy-profile migration, and suggested starting level. `src/core.js` owns learner state, recommendations, imports, feedback mapping, and wrappers around the existing model. `src/central-scope.js` snapshots and compares assigned central outcomes. `src/tool-audiences.js` records intended-task metadata independently of catalog assessments. `src/styles.css` and `src/shell.html` define the responsive presentation. `scripts/build.mjs` produces the standalone artifact. `tests/` checks source parity, recommendation behaviour, persistence formats, evidence preservation, and feedback import.

Only shared role-mapping metadata is added to the existing planner source. Planner behavior, the capability model’s substance, source workbook, assessed catalog, scores, and central plan selections are unchanged.
