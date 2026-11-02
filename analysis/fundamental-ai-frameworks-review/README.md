# Fundamental AI frameworks review

Status: **Core changes implemented in pathways v0.3 and learner 1.6.3, 2 November 2026. Other proposals remain for review.**

The user subsequently excluded OWASP from Foundation and approved the core OWASP, NIST AI RMF and MITRE ATLAS placements. See the [implementation record](implementation.md). The original report and its inputs below retain the earlier proposal, including the superseded Foundation addition; they are not the current decision source.

Open the [review report](outputs/report.html) or its [Markdown version](outputs/report.md). It recommends where original publisher AI frameworks and reference material should appear in the capability components, identifies existing selections, and separates immediate candidates from material needing edition, access, duration or assessment work.

The report proposes eight decisions on active catalogue resources and assessment of two additional original resources, CSA AICM and MAESTRO. Foundation’s previously Reviewed selection is preserved in the live scenario; adding OWASP LLM Top 10 is explicitly a new decision. None of the analysis files is a published or importable replacement pathway.

## Baseline and evidence

- Catalogue **v16**, snapshot `9ed4551ae565417e`, workbook SHA-256 `07a1829aeadffbe170d8aa1ebcf7d03e61b5248a9c8e53c990930fae22a1d6eb`.
- Capability model **2 revision 3**; Recommended Training Pathways **v0.2**; planner **2.2.1**; learner **1.6.1**.
- [Frozen pathway decision source](inputs/pathways-v0.2.json), [source identities](inputs/source-identities.json), [proposed additions](inputs/proposal.json), and a compressed byte-preserving copy of the verified imported catalogue in `inputs/catalogue-v16.json.gz`.
- [Catalogue evidence extract](outputs/catalogue-evidence.json) retains worksheet/row locations, descriptions, limits, current assignments and relevant saved scores/evidence.
- [Impact calculations](outputs/impact.json) use the existing shared component, duration and scoring functions. They illustrate all proposed additions using saved assessments, not revised-source scores. New CSA candidates and optional reading are excluded.

Publisher sources are linked beside claims in the report. Checks were made on 2 November 2026. The report distinguishes the specific OWASP 2026 release from its stale general index, MITRE v2026.10 from the saved v2026.08 title, the NIST draft/current-edition boundaries, and the UK code from the published ETSI standard. CSA full download packages and licensed ISO standard texts were not reviewed, and no new scores were assigned.

## Build and verification

Run from the repository root:

```sh
node analysis/fundamental-ai-frameworks-review/scripts/build.mjs
node analysis/fundamental-ai-frameworks-review/scripts/build.mjs --check
```

The builder needs `marked`. It tries a normal Node import, then the installed Codex runtime dependency; `MARKED_MODULE` can specify another absolute ESM module path. It uses the frozen v0.2 scenario and imported catalogue, verifies their hashes and the recorded calculation-source hashes, and writes only this analysis’s `outputs/`. `report-template.md` owns report prose; `inputs/proposal.json` owns the conditional additions. Component and time tables are generated together. Later model or scoring changes require reconciliation before rebuilding this dated report.

During the review the workspace switched from `codex/catalogue-v16-retirements` at `cefd60f` to `main` at `9441ba2`, restoring v15/pathways v0.1 in the live checkout. This analysis retains the original task baseline. The frozen v16 input was recovered read-only from `cefd60f` and matches the SHA-256 recorded before the switch. That commit also contains the expected catalogue-history snapshot. The v0.1 and v0.2 component and audience selections were confirmed identical; the difference is catalogue compatibility and publication metadata. Live sources were not restored or changed by this review.

The workbook importer ran in check-only mode using the installed runtime Python before the branch switch. It validated 516 active resources, 56,140 numerical scores, 280 explicitly unassessed rows and 9,591 coverage rows, with zero course changes. Report checks validate course/component references, exclusions, source identities, deduplicated time, unknown durations and the four Foundation outcome improvements. The original input hashes are verified against their Git checkpoint, and the final diff is restricted to the new analysis and analysis index. Browser review checks the report’s navigation, tables and readable layout.
