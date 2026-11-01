# Catalogue v14 — missing Udemy SecAI+ courses

Reviewed 1 November 2026 against v13, snapshot `ba0634eb6d9be98d`. The user requested the strongest missing courses by rating and number of reviews, then explicitly excluded Mana's course because of AI-generated content and poor quality. That is the user's quality judgement and is retained as an exclusion decision.

## Selection

Live Udemy Most Relevant and Most Reviewed results were compared with canonical URL slugs across Offers and Tool track. The shortlist uses **at least 4.5/5 and 25 course ratings**, balancing reception with some review volume. This is a pragmatic shortlist, not an independent course-quality measurement. Counts mean Udemy course ratings; they are not enrolments, written-review counts or instructor-wide ratings.

| ID | Instructor/provider | Course | Rating | Ratings | Full listed video |
| --- | --- | --- | --- | --- | --- |
| TR-281 | Mike Chapple / Fred Nwanganga | [CertMike complete course](https://www.udemy.com/course/comptia-secai-certmike/) | 4.6 | 580 | 6h 11m |
| TR-282 | Avnish Singh / Pavan Kumar | [Complete Course & Exam Prep 2026](https://www.udemy.com/course/comptia-secai-plus-cy0-001-exam-prep/) | 4.5 | 559 | 25h 30m |
| TR-283 | Alexander Oni | [Full Certification Prep Bootcamp](https://www.udemy.com/course/comptia-secai-cy0-001-full-certification-prep-bootcamp/) | 4.5 | 67 | 11h |
| TR-284 | Nasser Alaeddine | [Complete AI Security Course 2026](https://www.udemy.com/course/comptia-secai-plus-cy0-001-ai-security/) | 4.8 | 31 | 7h 41m |
| TR-285 | Vision Training Systems | [Complete Course: AI Cybersecurity](https://www.udemy.com/course/secai-cy0-001/) | 4.7 | 28 | 5h 45m |

Counts are dated observations. CertMike's header showed 580 while a dynamically loaded reviews section showed 586; 580 is retained consistently as the conservative header count. Current course pages supersede older indexed copies for the other counts and durations.

Vinay Kumar already appears as INT-1199; its URL slug matches, so it is not duplicated or reassessed. Networkel (4.3/96) and Cyvitrix (4.3/38) miss the rating threshold. Newer 4.8/5.0 offerings with very few ratings miss the count threshold. Practice-test-only products are outside this teaching-course shortlist. Mana is excluded even though its 4.7/58 reception passes the numeric thresholds. `sources.json` records the reasoning and public URLs. Avnish/Pavan and Nasser disclose AI use; the user's Mana exclusion is not interpreted as a blanket exclusion of any use of AI.

## Assessment boundaries

All **140 active outcomes per course** are assessed against the existing 0–3 rubric, with source URLs and dated rationale. The five curricula are assessed independently; scores are not transferred from official CompTIA training or another provider. Zeros represent insufficient public evidence, not proof of absence from purchased lessons. No new outcome receives 3: full knowledge completeness or full practical delivery is not established for these framework outcomes.

CertMike is video and knowledge checks. Alexander and Vision publish demonstrations; these do not establish learner execution. Avnish/Pavan advertises 25 role plays, assignments and a test; the published role plays concern explaining and defending decisions, and are not enough to infer full agent-operating practice. Nasser's interactive presentation and two practice exams do not establish hands-on implementation. Full video time applies, with additional unquantified assessment/role-play time clearly stated. No bank Udemy Business entitlement, fixed price, exam voucher, competence or operational authorisation is inferred.

All 529 existing resources remain identical at import level. The 140 outcomes, 23 scoring groups, existing exclusions, 280 unassessed rows and retained starter selections remain unchanged. V14 adds five Offers and 700 numeric scores, resulting in 534 resources and 58,100 active numeric scores. Both apps expose the additions without selecting them automatically.

## Reproduction and checks

`prepare.py` records research facts and independent outcome decisions, producing `sources.json`, `assessment.json` and exact typed `edits.json`. `author.mjs` authors those values with Artifact Tool; `assemble.py` appends styled rows while preserving the original workbook package. `calc_inputs.py` prepares a compact dependency model using untouched-catalogue aggregates as controls; `author.mjs calculate` recalculates affected results and probes score-change/core-gap behaviour. `assemble.py cache` retains the original Excel formulas and inserts verified saved results. `verify.py` independently imports/reconciles every Coverage row and checks original resources, formulas, cell styles and untouched ZIP parts.

Use the spreadsheet skill's bundled runtimes, setup and operation marker. Scratch files and renders belong under `.work/catalogue/v14/`. Sequence: `prepare.py`, `author.mjs edit`, `assemble.py apply`, `calc_inputs.py`, `author.mjs calculate`, `assemble.py cache`, `author.mjs before`, `author.mjs after`, `verify.py`. Copy `author.mjs` into the scratch directory with its runtime dependency link before running it. After promotion, preparation uses the archived v13 snapshot rather than a changed live snapshot. Verification/recalculation evidence states engine limitations: native Excel is unavailable, so this is not a native Excel save/reopen test.

The v13 workbook is preserved byte-for-byte in the archive. Previous evidence, research reports, presentations and release packages remain frozen. The model remains version 2 revision 3; only its catalogue source identity is refreshed.
