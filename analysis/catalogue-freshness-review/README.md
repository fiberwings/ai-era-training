# Catalogue freshness review

Status: **Proposal awaiting user review. No catalogue removals authorised or applied.** Review date: 2 November 2026.

Open [the review and proposed revised list](outputs/review.html). It shows all 18 proposed retirements, 13 retained entries needing refresh, and the complete proposed retained list of 516 resources. The separate internal AI use cases brief remains unchanged.

Sources: catalogue v15, snapshot `ff6d5a46d0450171`, workbook SHA-256 `07ce3343043c8312284a3f33c8d4530cc72b5ae8140bee9361588b8367b5f08a`; Recommended Training Pathways v0.1; retained legacy planner default. Public provider and platform evidence was checked on 2 November 2026 and is recorded in `inputs/review.json`. The workbook importer check confirmed 534 resources, 58,100 numerical scores, 280 explicitly unassessed rows and 9,591 course/need rows consistent with the saved Excel workbook.

All 534 resource records, their saved descriptions, limitations and assessment evidence were screened. Public research targeted potential retirement candidates; this is not a new syllabus assessment, a full provider-link audit or a lab-execution test for all retained courses. Model-version courses, retired runtimes/exams and superseded teaching editions are distinguished from transferable fundamentals and incidental model examples. A new provider update date alone does not establish an updated syllabus. Proposed retirement is not a statement that all material is factually wrong or that the provider has withdrawn the course.

The proposal preserves historical IDs, evidence, assessments and existing exclusions. No workbook, catalogue snapshot, app, model, recommendation, historical default or release is changed. The only proposed retirement currently selected by the retained legacy planner default is TR-229 in L3. That dependency must be resolved explicitly during an approved implementation; current Recommended Training Pathways select none of the 18.

Rebuild the proposal only:

```sh
node analysis/catalogue-freshness-review/scripts/build.mjs
```

The builder verifies the source identities, reconciles all 534 records, calculates catalogue-wide maximum outcome-score changes and records selected/pinned dependencies. It writes only this analysis's outputs. `outputs/impact.json` contains the calculated impact. `inputs/review.json` owns the proposal decisions; none is an approval.
