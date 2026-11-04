# Preparing our cyber workforce for the agentic era

A 21-slide pack created on 4 November 2026 from a user-reviewed skeleton. The editable deliverable is [AI-Era_Cyber-Workforce_Preparation.pptx](../../AI-Era_Cyber-Workforce_Preparation.pptx). It is a first step on the question of how to prepare the cyber workforce for the agentic era. It presents four connected pieces of work, and each section opens with a divider.

| Slides | Section | Content |
| --- | --- | --- |
| 1–2 | Opening | Cover (briefing slide 1, re-titled); "What has been prepared" introduces the four pieces. |
| 3–11 | 1. The framework | Divider; goal (a light-background version of the earlier opening slide); one-page view; Foundation; agentic levels; role specialisms with provisional domain tags; tool training; learning needs; from framework to training. |
| 12–13 | 2. Training catalogue | Divider; "How the training catalogue was built" (briefing slide 11, updated from v10 to v17). |
| 14–16 | 3. Learning app | Divider; the app for staff, with a screenshot of the For you page; how recommendations improve over time and where review stands. |
| 17–20 | 4. Baseline for all staff | Divider; the proposed Foundation + L1 baseline (10h 41m); what SecAI+ covers; building the use-case session. These adapt slides 4–6 of the 2 November CISO walkthrough. |
| 21 | Next steps | Adapted from slide 9 of the walkthrough. |

## History and decisions

- Section 1 is the eight-slide capability framework overview built earlier the same day. It went through three revisions: domain tags were added to the specialisms slide; an alternative one-page view ("option B") was tried and declined in favour of the original; and its opening slide became the light "goal" slide. That overview existed only as an uncommitted file. It, along with the option-B prototype, is kept in ignored scratch storage under `.work/presentations/framework-overview-20261104/`.
- The pack replaces the 4 November Framework and training decisions deck. Its bytes are in commit `d3769e1`, and its record is in [framework-training-decisions-20261104](../framework-training-decisions-20261104/).
- The pathway-builder slide (briefing slide 12) was removed at the user's request because the builder will not be delivered in its current form. Slide 11 now says that the catalogue and the learning app support each step.
- The baseline is presented as a **proposal**, not as the walkthrough's "mandatory 2027" framing. Coverage figures are assessed values: Foundation 61.0% and L1 62.6%. The planned use-case session earns no assessed coverage until it is evaluated.
- The catalogue figures come from `training-planner/public/data/catalogue.json` (v17), and the speaker notes record each figure. The status of other internal training (mylearnings and bank programmes) remains "Awaiting information".
- Ownership, the DOM7/R4.2 boundary, review status and app limitations (browser-local progress, Microsoft Forms not yet connected) are recorded in the speaker notes. They are not resolved here.

Content authority: model 2 revision 3, catalogue v17 snapshot `8bffc898c371360e`, Recommended Training Pathways v0.3 and learner app 1.6.3. The pack changes no framework, catalogue, pathway, app or ownership source. The briefing, the capability-needs deck and the CISO walkthrough are unchanged.

## Build and verification

Run from the repository root with the bundled runtime:

```sh
/Users/cyberk/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node presentations/source/cyber-workforce-pack-20261104/build.mjs
```

This imports the briefing's slides 1–8 and 11, adds the new slides, sets the order and page numbers, and writes a candidate and previews under `.work/presentations/cyber-workforce-pack-20261104/`. Add `--finalize` after visual review. This runs the package, 21-slide count, layout, heading-fit, font and re-import checks, then writes the final PPTX. The finalizer refuses to overwrite an existing final file or receipt.

To refresh the app screenshot (`assets/learning-app-for-you.png`), run [capture_learning_app.cjs](capture_learning_app.cjs) with Playwright. It completes quick setup as L1, Security operations & response, Microsoft 365 Copilot, and hides the confirmation toast:

```sh
NODE_PATH=/Users/cyberk/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules /Users/cyberk/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node presentations/source/cyber-workforce-pack-20261104/capture_learning_app.cjs .work/presentations/cyber-workforce-pack-20261104/assets
```

`validation.json` holds the finalization receipt, and `verification.json` records the content checks. The final deck was rendered and visually inspected. It has not been opened in native Microsoft PowerPoint.
