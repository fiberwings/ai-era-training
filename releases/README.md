# Release packages

Version-labelled standalone distributions, packaged on 1 November 2026:

| Package | Contents |
| --- | --- |
| [Training Planner 2.2.0](training-planner/2.2.0/Training-Planner.zip) | `Training-Planner.html`; catalogue v15 and both retained starter formats. |
| [My AI Learning Path 1.5.0](learning-path/1.5.0/My-AI-Learning-Path.zip) | `index.html`; catalogue v15 and Recommended Training Pathways v0.1. |

Both files can be opened locally after extraction. They need no neighbouring runtime files. Keep the existing app location/origin when replacing a copy, and export JSON backups before transferring plans. Source remains in [training-planner](../training-planner/README.md) and [learning-path](../learning-path/README.md), not in these ZIPs.

[Manifest](manifest.json) records package/member hashes and source identities. Planner 2.2.0 and learner 1.5.0 embed catalogue v15. The planner adds specialism pathway cards, role filtering and product/task resource discovery for tool pathways, retains saved internal briefs in Full catalogue, and preserves existing starters. Learner 1.5.0 publishes Recommended Training Pathways v0.1 with Reviewed Foundation/L1, pending-review labels for other recommendations, Proposed internal learning and an explicit coached-route choice. It preserves the single-form onboarding introduced in 1.4.0 and existing personal learning. [Publication verification](../learning-path/qa/publication-1.5.0.json) records the checks. The previous [Planner 2.1.3](training-planner/2.1.3/Training-Planner.zip), [learner 1.4.0](learning-path/1.4.0/My-AI-Learning-Path.zip), [learner 1.3.4](learning-path/1.3.4/My-AI-Learning-Path.zip), [Planner 2.1.2](training-planner/2.1.2/Training-Planner.zip), [learner 1.3.3](learning-path/1.3.3/My-AI-Learning-Path.zip), [Planner 2.1.1](training-planner/2.1.1/Training-Planner.zip), [learner 1.3.2](learning-path/1.3.2/My-AI-Learning-Path.zip), [Planner 2.1.0](training-planner/2.1.0/Training-Planner.zip), [learner 1.3.1](learning-path/1.3.1/My-AI-Learning-Path.zip), [Planner 2.0.9](training-planner/2.0.9/Training-Planner.zip) and [Planner 2.0.8](training-planner/2.0.8/Training-Planner.zip) packages remain unchanged. Planner 2.1.0 introduced proposed-training Excel export/reuse and the internal-learning component correction.

The previous ZIP and Windows update kit contained planner 2.0.6 and are in [archive](../archive/releases/planner-2.0.6/). The old v8 package is also archived. No current Windows update kit is published by this reorganisation; use the current repository and catalogue guide for maintenance.

After an intentional release update, rebuild and verify the apps before packaging. From the repository root, create the destination version directory and package the single runnable file with Python's `zipfile` command (or equivalent), then refresh the manifest and this index. Do not package dependency folders, personal learner exports or browser data.
