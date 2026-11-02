# Catalogue v17 — workbook simplification

Implemented on 2 November 2026 after the user approved the read-only simplification proposal. [Current workbook](../../AI_Era_Cyber_Training_Catalogue_v17.xlsx); [unchanged v16 archive](../../../archive/catalogues/AI_Era_Cyber_Training_Catalogue_v16.xlsx).

The workbook has 12 tabs instead of 18. Empty Paths and its 18,360-formula Path detail sheet, obsolete Matrix and Tool adoption, and historical Screening log are removed from the working copy. Codes is consolidated into Scoring guide. All remain available in archived v16. README is shortened from 121 rows to a current maintenance guide.

Offers, Tool track and Proposed training come first. Offers removes Needs (assessed), Used in matrix rows and Full or Strong needs. Tool track removes Supports matrix rows. Build items removes Needed by wave, Matrix rows and two obsolete standalone planning notes. Existing descriptions, review decisions, source links and evidence remain. Older descriptive columns and the original proposal IDs are hidden for everyday use.

The importer reads Tool track and Build items by header, maintaining compatibility with earlier workbooks and the new layout. All 516 active course objects, 18 retirement records, 140 active outcomes, 23 scoring groups, six build templates and the saved internal brief are exactly equal to the v16 import. Active records retain 56,140 numeric scores and 280 explicit unassessed entries. Course, outcome and score row references are unchanged. No reassessment or curriculum selection change is part of this release.

Needs, Rubric, Scores, Coverage, V8 audit and Retirements preserve their exact original worksheet bytes. Every retained cell in the other source tables preserves its value, formula, cache and style while allowing the approved column moves. Scoring guide retains its 70% and 30% thresholds and original named references. Its approved must-have explanation is now shown once, and the obsolete Excel-only path description is replaced by the existing best-score rule and current planning destination.

Artifact Tool authors the new README and guide additions. `workbook.py` assembles those changes and the structural edits into the source package, avoiding a full-workbook rewrite of assessment evidence. The script reuses the preserved v16 package/style utilities. Bounded before/after workbook views are rendered with Artifact Tool; all retained tabs are visually reviewed. Unchanged assessment formula caches are independently reconciled rather than recalculated by a different engine.

`verify.py` checks retained worksheet bytes, source cells, styles, table headers, removed dependencies, zero formula errors and semantic equality with the saved v16 import. It also independently reconciles all 9,591 Coverage records. [Workbook verification](workbook-verification.json) records the exact hash and snapshot. [Archive record](archive-record.json) identifies the preserved v16 workbook.

Ordinary maintenance follows the [catalogue guide](../../README.md). These scripts are release provenance, not an automatic reassessment or publication workflow.

## Distribution checks

Planner **2.2.2** embeds the new snapshot and retains the existing starter selections; only their catalogue identity changes. Excel proposal exports keep original IDs hidden and retain every field for round-trip reuse. The coordinated core-framework publication updates pathways **v0.3** and learner **1.6.3** to the same v17 evidence; its recommendation additions are separately recorded in the learner verification.

[Release verification](release-verification.json) records 81 planner JavaScript checks, 20 Python checks and nine browser flows, including Excel export/reimport. The final export change was checked again. [Learner verification](../../../learning-path/qa/core-references-1.6.3.json) records its own checks. Both ZIPs match the current runnable HTML. [Historical integrity](historical-integrity.json) verifies 308 pre-existing payloads unchanged; the archive and release indexes are intentionally updated. [Guide preview](qa/guide.png) and [catalogue preview](qa/offers.png) retain visual evidence.
