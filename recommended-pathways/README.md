# Recommended Training Pathways

Current version: **0.3 — 2 November 2026**. Foundation and L1 are **Reviewed**. L2, L3, specialist, coached and tooling recommendations are **AI recommendation - to be reviewed**. Core reference placements for OWASP, NIST AI RMF and MITRE ATLAS are **Reviewed**, separately from the wider components. The overall scenario remains a **Draft**.

| File | Purpose |
| --- | --- |
| [Pathway guide](Recommended-Training-Pathways.md) | Readable recommendation, role branches, sequencing, time, coverage and review status. |
| [Planner scenario](Recommended-Training-Pathways.json) | Editable decision source and schema-3 import for Training Planner. |
| [Internal training briefs](Internal-Training-Briefs.md) | Teaching, practice, expected evidence, prerequisites, hours and suggested facilitator roles. |
| [Coverage record](coverage.json) | Recalculated outcome evidence, remaining gaps and deduplicated time for each component and audience. |

The capability framework owns target outcomes and applicability. The catalogue owns course records, assessments and saved internal briefs. This deliverable owns the recommended selections, their composition and review decisions. Its version is independent of the catalogue, model, app and scenario-schema versions.

Version 0.3 implements the user-approved core framework recommendations. Foundation/L1, existing selections and internal teaching are preserved. Resource reviews are stored in component `courseReviews`, with placement/source guidance in `publication.coreReferences`. The guide and learner course details show those decisions without approving whole specialist pathways. ATLAS and NIST reading time remains unknown. See the [implementation record](../analysis/fundamental-ai-frameworks-review/implementation.md).

Version 0.2 was a catalogue compatibility update following the 18 user-approved retirements. No retired course was selected or pinned. All components, audience paths, internal briefs, exclusions, selection-review labels, time and assessed/planned coverage are unchanged. The scenario ID remains stable for saved learner scope compatibility. TR-229 remains a recognised retired exclusion. This maintenance publication does not approve the other AI-generated recommendations.

## Current decisions

- Foundation owns TR-281, TR-145 and the saved one-hour **AI use cases** brief. L1 and higher pathways inherit the same learning once. The Foundation/L1 commitment is **10h 41m**, before additional tool training.
- Foundation and L1 selections were reviewed by the user on 1 November 2026. This review does not change course assessment scores or the internal brief's Proposed delivery status.
- TR-229 **Reasoning with o1** is excluded. The user's reference to O2 was interpreted as this model-specific course in the historical recommendation; no separate O2 course was assigned. TR-127 and the other recorded exclusions remain excluded.
- OWASP LLM Top 10 is recommended in AI security and testing (including architecture/red-team variants), outside Foundation. OWASP Agentic Top 10 remains in L2 and extends to relevant role components. NIST AI RMF is recommended in governance/assurance; ATLAS in threat intelligence, testing and AI security. These resource choices were reviewed on 2 November 2026.
- The wider pathways are AI generated and await review. Historical internal activities are proposed teaching, with accountable owners unassigned. Suggested facilitators remain separate from assigned owners.
- Course budgets, delivery dates and the next scheduled review date are unset. Product training is unselected and adds unknown time to the published totals.
- The historical annual report, blank planner starter and retained schema-2 planner default remain separate. The learner app publishes this recommendation, retaining review labels and existing personal learning.

## Import into the planner

1. Open [Training Planner](../training-planner/Training-Planner.html).
2. Select **Scenario & exports → Import scenario JSON**.
3. Choose [Recommended-Training-Pathways.json](Recommended-Training-Pathways.json), then select **Load JSON**.
4. Review **Learning components**, **Audience paths** and **Path coverage**. Each path and component begins its rationale with its review status.
5. Export reloadable JSON to retain changes. Review and reconcile those changes into this maintained source before publishing a revised pathway version.

Import creates a separate scenario with a new local ID and an “(imported)” name suffix. Re-importing creates another copy; it does not overwrite a saved plan. Review labels are stored as metadata and visible rationale text, not automatic workflow gates. A local edit does not automatically reset these descriptive labels: update the review decision explicitly when promoting revised content.

The [learner app](../learning-path/index.html) now consumes this source directly. Run `node learning-path/scripts/build.mjs` from the repository root to rebuild it after an intentional source update. Publication preserves native component variants and displays review labels. The learner app uses standard level recommendations without a route selector. Proposed internal learning stays upcoming until its delivery status is Ready.

## Maintain and rebuild

Edit the JSON scenario for selections, internal briefs, audience composition, review status, owners, dates and version. Keep each rationale's opening review label consistent with its metadata. Course-specific reviews must refer to selected resources; reconcile their status/date/basis and the core reference placement list when changing selections. Resource approval never implicitly changes a component review. Preserve the saved AI use cases item, stable IDs and user-reviewed choices. Variants retain the historical differences between architecture, assurance, forensics, red-teaming and IAM branches without assigning extra exercises through shared components.

The guide, internal-brief register and coverage record are generated by [scripts/build.mjs](scripts/build.mjs); do not edit generated copies independently. The script always uses the live catalogue (`training-planner/public/data/catalogue.json`) and records its identity in the scenario JSON automatically; `--check` fails if that identity is stale. It validates the scenario against the declared model version/revision, checks references and preserves the distinction between assessed and planned coverage. Calculation-module hashes are recorded in the coverage output.

From the repository root:

```sh
node recommended-pathways/scripts/build.mjs
node recommended-pathways/scripts/build.mjs --check
```

A catalogue refresh republishes the current selections against the new evidence; it does not approve them. If a selected course disappears, the build stops with its ID. Raise the pathway version when the recommendation itself changes; Git keeps previous editions. Annual scheduling and delivery commitments belong in a subsequent delivery plan.

## Verification

The build checks core reference placements and course-specific review metadata, explicit unknown-time totals, schema-3 validation and JSON round-trip preservation, valid review labels, exclusion decisions, nine-role references, the exact saved AI use cases brief and consistent shared internal-item definitions. `--check` verifies the generated guide, brief register and coverage record against the saved source without rewriting them.

The initial v0.1 passed 19 existing component regression checks and a planner import smoke check covering review labels, Foundation/L1 inheritance, L3 exclusion, specialist variants and JSON export. All 19 historical specialist branches were reconciled for course choices and internal activity IDs. Current v0.3 results, exact placements and time/coverage impacts are in [verification.json](verification.json).
