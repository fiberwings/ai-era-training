# Reorganisation verification

Completed 1 November 2026. [Machine-readable results](verification-2026-11-01.json) record the commands and preservation checks; [inventory](inventory-2026-11-01.json) records each original file and destination.

| Check | Result |
| --- | --- |
| Planner JavaScript regression suite | 67 passed; no failures or skips. |
| Planner Python regression suite | 14 passed, including the relocated v8 workbook fixture, standalone packaging and local HTTP server checks. |
| Learner JavaScript regression suite | 65 passed; no failures or skips. |
| Learner feedback-import suite | 3 passed. |
| Current workbook reconciliation | Active JSON equals the v12 workbook import; all 9,453 course/need coverage rows reconciled. Verified using the script's new default workbook location. |
| Framework and starter generation | Successful: 140 outcomes, 23 scoring groups, 17 responsibility packages, 21 components and 19 audience templates. |
| Both standalone app builds | Successful; both HTML outputs byte-identical to the pre-move artifacts. |
| Browser loading and visual check | Both standalone files opened in isolated Chromium at 1440 × 1000; expected interfaces rendered and no JavaScript page errors occurred. Planner starts blank; learner retains its Draft recommendations. |
| Data and presentation preservation | Workbooks, CSV/JSON crosswalk data, catalogue snapshots, both default scenarios, runtime source and both live PowerPoints remain byte-identical. |
| Readable framework | Body unchanged; the footer updates moved links and corrects its assessment-source reference from v11 to the current v12 snapshot. |
| Original-file inventory | All 1,547 original files accounted for. 1,538 retain identical bytes; nine deliberately edited files contain documentation, ignore rules or path corrections. No original file is missing. |
| Archive and evidence preservation | Reports, scenarios, earlier workbooks/models, historical scripts, research evidence and original manifests preserved unchanged. |
| Current release packages | Both ZIPs passed integrity checks; extracted HTML exactly matches its current source artifact. Package/member hashes are in [the release manifest](../releases/manifest.json). |

All 113 local links in 17 active documents resolve against the new layout. Frozen historical handovers, archived reports and source-history scripts intentionally preserve original paths; their reconstruction point is Git checkpoint `182e18c`.

The Python workbook checks used the bundled runtime with `openpyxl`; the system Python initially lacked that dependency. The local-server regression ran with permission to bind its temporary loopback port. No dependencies were installed or global settings changed.

Raw logs, the temporary check scripts and screenshots are in ignored `.work/verification/`. They are local working evidence; the summary and file hashes above are versioned.

Scope was limited to the approved reorganisation, source/reference updates, documentation and release packaging. Existing app defaults were explicitly retained. No presentation content, curriculum assessment, personal browser data, hosting configuration or remote Git state was changed.
