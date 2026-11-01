# SecAI+ and ISC2 Building AI Strategy — framework review

Status: research completed 1 November 2026; decisions subsequently promoted into catalogue v13 and both apps. The report retains its v12 comparison baseline. See [catalogue update evidence](../../catalogue/evidence/v13/README.md).

Question: how far do the public teaching specifications for these two offers cover the full current workforce capability framework, including must-have outcomes?

Open [the report](outputs/review.html). The report includes the compact comparison, all 23 need groups, source register and all 140 outcome decisions. [CSV audit](outputs/outcome-assessment.csv) and [calculated results](outputs/metrics.json) are also provided.

Sources of authority: catalogue v12, snapshot `6db669ed065cab54`; capability model 2 revision 3; the current crosswalk and original 0–3 scoring rubric. The workbook owns current assessments; the preserved report shows the research basis for the v13 update. Conditional must-haves are included for this whole-framework audit, not assigned to every employee.

The SecAI+ column assesses a training route aligned to CY0-001, using official CertMaster Perform product information, the CompTIA objectives and detailed authorized-training outlines. Partner-specific exercises are corroborating evidence, not a guarantee of identical labs in every CertMaster purchase. Consequently no practical outcome receives a 3 based on partner lab descriptions alone. The exam-only TR-023 record is not treated as teaching. ISC2 is assessed as its complete six-course, 16-hour certificate.

Public synopsis review, not a paid-course inspection. A zero means no sufficiently specific public teaching evidence was found. Exact percentages describe the documented match to this framework, not course quality, learner competence or operational authorization.

Reproduce from repository root:

```sh
python3 analysis/secai-isc2-framework-review/scripts/build_report.py
```

Inputs contain the new assessment and source notes. The script validates source identity, all 140 outcome IDs, source references and score ranges, then calculates equal-weight need percentages and deduplicated combined coverage. Full-course time is retained. No catalogue changes or app rebuilds are required.
