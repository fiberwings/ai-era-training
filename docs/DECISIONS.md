# Current decisions

Decisions that still constrain the work. Superseded detail and release notes are in [the changelog](CHANGELOG.md) and Git history.

## Framework

- The model is Foundation + one agentic level (L1 assistance, L2 supervision, L3 build/evaluate) + role specialisms + tool training. Foundation is common knowledge, not a level. Nine roles with responsibility packages, aligned to ENISA ECSF.
- 140 active outcomes in 23 scoring groups. Retired N5.2 maps to N5.1; N5.8 is the separate cyber-risk overview.
- Open issue: the DOM7 secure-coding / R4.2 ownership boundary is unresolved.

## Catalogue

- The workbook owns courses, assessments and evidence. Its Retirements sheet owns lifecycle; 18 courses were retired on 2 November 2026 and keep metadata (not credit) for saved-plan history.
- Proposed internal training lives in the Proposed training sheet; it is planned teaching, never assessed coverage.
- The Udemy SecAI+ courses TR-281–TR-285 link to the internal Udemy Business tenant (`societegenerale.udemy.com`). TR-281 access was confirmed by the user; TR-282–TR-285 were switched at user request. Use the internal link only where access is confirmed; the public page remains the assessment source.
- Excluded from the programme: TR-127 (user decision) and TR-229 Reasoning with o1 (no replacement assigned). Mana's SecAI+ course is excluded on quality.
- 13 retained courses are flagged for content refresh; no new credit until reassessed.

## Recommended pathways (v0.3, Draft)

- The scenario JSON owns selections, audiences and review decisions; it is the learner app's publication source.
- Foundation/L1 is **Reviewed**: TR-281 + TR-145 + the one-hour AI use cases internal brief, assigned once in Foundation and inherited. No OWASP in Foundation.
- Core references are **Reviewed** placements: TR-109 OWASP LLM Top 10, TR-110 OWASP Agentic Top 10, TR-117 MITRE ATLAS, TR-118 NIST AI RMF (recorded in component `courseReviews`). ATLAS and NIST durations remain unknown; the ATLAS edition discrepancy stays explicit.
- Everything else (L2, L3, specialist, coached, tooling) is **AI recommendation - to be reviewed**. Internal training stays Proposed with unassigned owners.

## Learner app

- Publishes the recommended pathways; accepts schema-2/3 central plans. Standard level recommendations only (the route selector was removed; saved route preferences are ignored but accepted).
- Quick onboarding: level, broad responsibility areas, planned tools, optional Python/Git comfort. Detailed preferences and the starting-point check are optional.
- For you: four overview/progress cards, scrolling layers, each with Central recommendations then Suggested for you. Empty central lanes stay visible. Explore training has Specialisation and Tool filters.
- Feedback goes to one company-tenant Microsoft Forms form (connected 5 November 2026; submission is self-reported). A full submit-and-import round trip has not yet been verified.

## Planner

- Will not be delivered in its current form. The component workspace starts blank; the legacy workspace keeps the 2027 example (TR-229 removed) by explicit choice.
- Planner review gates were removed and must not return.

## Presentations

- Four live decks. The model briefing's catalogue appendix dates from v10 and needs a freshness review before being presented as current. Ownership and dates in the CISO walkthrough are provisional; formal approval is a separate session.
