# Framework and training decisions

Seven-slide presentation created 4 November 2026 from the user-reviewed skeleton. Replaced the same day at the user's request by the [cyber workforce preparation pack](../cyber-workforce-pack-20261104/); the deck is retained in commit `d3769e1` (`git show d3769e1:presentations/AI-Era_Framework_Training-Decisions.pptx`).

| Slide | Purpose |
| --- | --- |
| 1. The framework: a reference for training decisions | Explain the common reference for discussing and deciding staff learning. |
| 2. The framework in one page | Connect Foundation, L1/L2/L3, specialisms and tool training to detailed needs, outcomes and training. |
| 3. Foundation and its learning needs | Visually pair Foundation with N1–N5 and examples of detailed outcomes. |
| 4. Agentic levels and their learning needs | Pair each level with the applicable needs and preserve the work/seniority distinction. |
| 5. Specialisms, domains and learning needs | Map all nine roles to provisional domains and relevant needs, with ECSF alignment. |
| 6. Tool training follows access and intended work | Connect access, assigned tasks and hands-on learning for users, supervisors and builders. |
| 7. Selecting and building training | Show existing-course selection, internal learning development and pathway assembly. |

The separate needs slide and worked-example slide were removed at the user's request. Slides 3–5 carry the needs linkage directly. The deck adapts actual slide objects from the briefing's first seven slides, preserving its 1280 × 720 canvas, theme, master, IBM Plex Sans typography, backgrounds and recurring elements. The domain mapping is a native editable table; all diagrams and text are editable.

Content authority is model 2 revision 3 with catalogue v17 snapshot `8bffc898c371360e`. Detailed source/outcome mappings are in speaker notes. The ENISA ECSF publication was checked on 4 November 2026: <https://www.enisa.europa.eu/publications/european-cybersecurity-skills-framework-role-profiles>. The project's nine role groupings are an adaptation of ECSF profiles, not a claim that ECSF defines the same nine roles.

Domain ownership comes from slide 2 of the 2 November next-steps walkthrough and remains provisional. Slide 5 explicitly flags the DOM7 secure-coding boundary against R4.2 code-analysis needs under Vulnerability & exposure management. No role, outcome, ownership approval, course selection or app identity changes are made by this deck.

## Build and verification

Run from the repository root with the bundled runtime:

```sh
/Users/cyberk/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node presentations/source/framework-training-decisions-20261104/build.mjs
```

This imports the reference and writes a candidate and renders under `.work/presentations/framework-training-decisions-20261104/`. `ARTIFACT_NODE_MODULES` can override the bundled package path. Add `--finalize` after visual review to run package, seven-slide count, layout, font, native-table and re-import checks, create the final PPTX and render the saved result. The finalizer refuses to overwrite an existing final file or scratch validation receipt; preserve both before an intentional replacement. `validation.json` retains the finalization receipt. `verification.json` records final content checks and visual review. Renders are scratch files, not extra live deliverables.

The final deck was rendered and visually inspected. This is not a native Microsoft PowerPoint execution test. The three prior decks and framework/catalogue/app sources are preserved.
