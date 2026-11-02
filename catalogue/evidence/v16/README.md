# Catalogue v16 — approved retirements

Applied **2 November 2026**, after the user reviewed the [freshness review](../../../analysis/catalogue-freshness-review/README.md) and explicitly requested the retirements and refresh of relevant current apps. Historical app versions are preserved.

Current workbook: [AI Era Cyber Training Catalogue v16](../../AI_Era_Cyber_Training_Catalogue_v16.xlsx). Snapshot: `9ed4551ae565417e`. Workbook SHA-256: `07a1829aeadffbe170d8aa1ebcf7d03e61b5248a9c8e53c990930fae22a1d6eb`. Assessment evidence retains its original dates; this release is a lifecycle change, not a reassessment.

## Active catalogue and preserved evidence

- **516 active resources**: 403 Offers and 113 Tool track entries; one separate proposed **AI use cases** internal brief remains unchanged.
- **18 retired resources**. The workbook Retirements register records the approved IDs, titles, reasons, date and public source links. Offers and Tool track default to **Lifecycle = Active**. Clear the filter to inspect the original retired records.
- All 534 original course records, 58,100 numerical assessment rows, 280 explicitly unassessed rows and 9,591 historical course/need coverage rows remain at their original source references. Existing assessment worksheet XML and cached results are byte-identical to v15.
- Current apps import 56,140 numerical scores and 280 explicitly unassessed rows for the active courses. Every retained course object, all 140 outcomes, the 23 scoring groups and each outcome's catalogue-wide best score are unchanged. The internal brief is unchanged.
- Scores, Coverage, Paths, Path detail, Matrix and audit sheets preserve historical evidence/planning. The active catalogue views and apps exclude retirements; the model and recommended pathways retain curriculum authority.

## Retirements

| ID | Training |
| --- | --- |
| TR-229 | Reasoning with o1 |
| TR-259 | Prompt Engineering with Llama 2&3 |
| TR-234 | Introducing Multimodal Llama 3.2 |
| TR-214 | Building with Llama 4 |
| TR-268 | Pair Programming with a Large Language Model |
| TR-245 | Building Your Own Database Agent |
| TR-247 | AI Agentic Design Patterns with AutoGen |
| INT-B14 | AI-900 Azure AI Fundamentals 100% Original Practice Exam |
| INT-B15 | AI-900: Microsoft Azure AI Fundamentals AI-900 Practice Test |
| INT-B16 | AI-900: Microsoft Azure AI Fundamentals with practice tests |
| INT-B17 | AI-900: MS Azure AI Fundamentals – Learn & Get Certified |
| INT-077 | A Deep Dive into LLM Red Teaming |
| INT-476 | AI Security Bootcamp: LLM Hacking Basics |
| INT-1589 | GenAI Cybersecurity Solutions: OWASP Top 10 for LLM Apps |
| INT-2252 | Mastering the OWASP Top 10 for LLM Applications |
| INT-2537 | Practical GenAI: Basics, Tools, Use cases, Ethics, Future |
| INT-638 | Artificial Intelligence Ethics Certification |
| TR-130 | Multilayer Framework for Good Cybersecurity Practices for AI |

The Llama 4 retirement follows the approved programme direction; it is not a claim that the provider or model is universally unsupported. LlamaIndex, broader transferable security/guardrail courses and the 13 items flagged for content refresh remain active. Those 13 need subsequent content review; their assessments were not revised here.

## Current-app impact

[Planner 2.2.1](../../../training-planner/Training-Planner.html) and [AI Cybersecurity Learning 1.6.1](../../../learning-path/index.html) embed v16. Retired resources do not appear in catalogue discovery, new selections or recommendations. Retirement metadata supplies names and reasons for old records, with no current assessment credit.

The planner's component starter remains blank. The current legacy L3 example removes **TR-229**, without assigning a replacement, and advances to plan revision 3. Other selections, budgets and overrides are unchanged. Own-layer scores fall to zero for N2.1, N2.2, N6.2, N6.5 and N10.4 before considering inherited/internal teaching. Its [previous default](../../../training-planner/scenario-history/default-before-v16-retirements.json) is preserved.

[Recommended Training Pathways v0.2](../../../recommended-pathways/README.md) is a compatibility publication. None of the 18 was selected or pinned. Every component, audience, selection, exclusion, review label, brief, time and coverage result is unchanged from v0.1. Its stable scenario ID preserves learner scope compatibility. The [v0.1 decision package](../../../archive/recommended-pathways/v0.1/) is archived byte-for-byte. Outstanding AI recommendations remain to be reviewed.

Saved browser plans are not rewritten or stripped of retired choices. Planner selections show retirement warnings and remain exportable for review. Learner completions, feedback, notes and dates remain readable in history. App paths, storage keys and backup formats are unchanged. Model **2 revision 3** is rebuilt only for the source catalogue identity; approved prose and applicability are unchanged. Existing release ZIPs and historical work remain intact.

## Build and verification

`author.mjs` uses Artifact Tool to author the retirement register, lifecycle formulas and README changes. A bounded workbook view is rendered before and after. `workbook.py` merges only authored cells and the new sheet into the original OOXML package, retaining the original tables, links, assessment caches and source rows. The new lifecycle formulas were recalculated and tested by temporarily changing a registry ID and checking the dependent status.

Sources: [approved inputs](inputs.json), [original review](../../../analysis/catalogue-freshness-review/inputs/review.json), [archive record](archive-record.json). Rebuild scripts are evidence for this release; ordinary future maintenance follows the [catalogue guide](../../README.md). Artifact Tool and lxml are required to reproduce authoring/assembly; openpyxl is used only for read-only validation.

[Workbook verification](workbook-verification.json) records reconciliation, preserved original cells/style indices and zero formula errors. [Historical integrity](historical-integrity.json) records 291 pre-existing files, checked byte-for-byte, including previous app packages, archives and catalogue/scenario snapshots. [Release verification](release-verification.json) records automated and browser checks for the final current builds.

Read-only verification from the repository root:

```sh
python3 catalogue/evidence/v16/verify.py
python3 training-planner/scripts/verify_workbook.py catalogue/AI_Era_Cyber_Training_Catalogue_v16.xlsx
node recommended-pathways/scripts/build.mjs --check
```
