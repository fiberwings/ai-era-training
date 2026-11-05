# Catalogue v18 — internal Udemy Business links for SecAI+ courses

Released 5 November 2026. Workbook: [AI_Era_Cyber_Training_Catalogue_v18.xlsx](../../AI_Era_Cyber_Training_Catalogue_v18.xlsx), snapshot `73d3456ec0e1d7ad`, SHA-256 `48f00bf87b004c0a89219e605c7ea958a0cffbe4bc1a42cb8c3ddf31b1dfa3a6`. The unchanged v17 workbook is [archived](../../../archive/catalogues/AI_Era_Cyber_Training_Catalogue_v17.xlsx) ([record](archive-record.json)).

## Why

Before pathways v0.1, the shared Foundation course was INT-437, a Udemy Business course linked through `societegenerale.udemy.com`. Every learner saw that internal link. On 1 November the reviewed Foundation/L1 bundle changed to TR-281 (CertMike SecAI+) and TR-145. TR-281 and the other Udemy SecAI+ courses TR-282–TR-285 were added in v14 with their public `www.udemy.com` pages and an unverified Udemy Business entitlement. As a result, the central Foundation lane no longer showed an internal Udemy link.

On 5 November 2026 the user confirmed that `https://societegenerale.udemy.com/course/comptia-secai-certmike/` opens TR-281 in the company tenant. The user then asked for the other four SecAI+ courses to be switched to the internal subdomain as well. Their access was not separately checked during this change.

## Change

Only Offers rows 414–418 changed. Each row uses the same course slug on the internal host:

| ID | Row | Internal URL (column Q and its cell hyperlink) | Cost (H) | Fit note (U) access phrase |
| --- | --- | --- | --- | --- |
| TR-281 | 414 | `https://societegenerale.udemy.com/course/comptia-secai-certmike/` | Internal — Udemy Business access confirmed 5 Nov 2026 | Udemy Business inclusion confirmed 5 Nov 2026. |
| TR-282 | 415 | `…/course/comptia-secai-plus-cy0-001-exam-prep/` | Internal — Udemy Business link set at user request 5 Nov 2026 | Internal Udemy Business link set at user request 5 Nov 2026. |
| TR-283 | 416 | `…/course/comptia-secai-cy0-001-full-certification-prep-bootcamp/` | as TR-282 | as TR-282 |
| TR-284 | 417 | `…/course/comptia-secai-plus-cy0-001-ai-security/` | as TR-282 | as TR-282 |
| TR-285 | 418 | `…/course/secai-cy0-001/` | as TR-282 | as TR-282 |

Previous values: the public `https://www.udemy.com/course/<slug>/` URL; cost "Variable by region/promotion; Udemy Business entitlement unverified"; fit-note phrase "Subscription inclusion unverified."

The edits were made directly in `xl/worksheets/sheet10.xml` and its hyperlink relationships. Every other workbook part is byte-identical to v17, including cached formula results. Provider, Sources (column V), scores, evidence and the public assessment source URLs are unchanged; the public pages remain the assessment sources. No Offers URL now points to `www.udemy.com`.

## Verification

- The importer reports 516 resources, 56,140 scores and 280 unassessed rows, and it validated all 9,591 coverage rows. The snapshot differs from v17 only in identity metadata and the `url`, `cost` and `limitations` fields of TR-281–TR-285.
- Recommended Training Pathways v0.3 selections, review labels and coverage are unchanged. Only the catalogue identity and a decision-log entry changed.
- Planner 2.2.3 and learner 1.6.4 were rebuilt. The tests passed: 81 planner JavaScript, 20 planner Python, 92 learner JavaScript and 3 learner Python.
- Browser checks in learner 1.6.4:
  - The Foundation TR-281 card's "View course with provider" opens the `societegenerale.udemy.com` URL and shows the confirmed access note.
  - TR-285, found through Explore, opens its internal URL and shows the user-request note.
