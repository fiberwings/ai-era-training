# Release packages

Current version-labelled standalone distributions:

| Package | Contents |
| --- | --- |
| [Training Planner 2.2.2](training-planner/2.2.2/Training-Planner.zip) | `Training-Planner.html`; catalogue v17, blank component starter and retained legacy example; simplified Excel export. |
| [AI Cybersecurity Learning 1.6.3](learning-path/1.6.3/My-AI-Learning-Path.zip) | `index.html`; catalogue v17 and Recommended Training Pathways v0.3, with approved core-reference placements. |

Both files can be opened locally after extraction. They need no neighbouring runtime files. Keep the existing app location/origin when replacing a copy, and export JSON backups before transferring plans. Source remains in [training-planner](../training-planner/README.md) and [learning-path](../learning-path/README.md), not in these ZIPs.

[Manifest](manifest.json) records package/member hashes and source identities. Planner 2.2.2 and learner 1.6.3 embed catalogue v17, whose imported evidence is identical to v16: 516 active resources after 18 approved retirements. The catalogue workbook has 12 tabs; removed planning/history material is preserved in archived v16. The planner's starters and saved personal plans remain compatible. Learner 1.6.3 publishes the separately approved core-reference additions in Recommended Training Pathways v0.3, retaining standard-level recommendations, progress cards, central/optional lanes and personal records. See [v17 catalogue verification](../catalogue/evidence/v17/release-verification.json) and [learner 1.6.3 verification](../learning-path/qa/core-references-1.6.3.json).

The previous [Planner 2.2.1](training-planner/2.2.1/Training-Planner.zip) and [learner 1.6.2](learning-path/1.6.2/My-AI-Learning-Path.zip) remain byte-for-byte unchanged.
The previous [Planner 2.2.0](training-planner/2.2.0/Training-Planner.zip) and [learner 1.6.0](learning-path/1.6.0/My-AI-Learning-Path.zip) remain byte-for-byte unchanged.
The previous [learner 1.6.1](learning-path/1.6.1/My-AI-Learning-Path.zip) and [learner 1.5.0](learning-path/1.5.0/My-AI-Learning-Path.zip), [Planner 2.1.3](training-planner/2.1.3/Training-Planner.zip), [learner 1.4.0](learning-path/1.4.0/My-AI-Learning-Path.zip), [learner 1.3.4](learning-path/1.3.4/My-AI-Learning-Path.zip), [Planner 2.1.2](training-planner/2.1.2/Training-Planner.zip), [learner 1.3.3](learning-path/1.3.3/My-AI-Learning-Path.zip), [Planner 2.1.1](training-planner/2.1.1/Training-Planner.zip), [learner 1.3.2](learning-path/1.3.2/My-AI-Learning-Path.zip), [Planner 2.1.0](training-planner/2.1.0/Training-Planner.zip), [learner 1.3.1](learning-path/1.3.1/My-AI-Learning-Path.zip), [Planner 2.0.9](training-planner/2.0.9/Training-Planner.zip) and [Planner 2.0.8](training-planner/2.0.8/Training-Planner.zip) packages remain unchanged. Learner 1.5.0 introduced publication of Recommended Training Pathways v0.1; planner 2.1.0 introduced proposed-training Excel export/reuse and the internal-learning component correction.

The previous ZIP and Windows update kit contained planner 2.0.6 and are in [archive](../archive/releases/planner-2.0.6/). The old v8 package is also archived. No current Windows update kit is published by this reorganisation; use the current repository and catalogue guide for maintenance.

After an intentional release update, rebuild and verify the apps before packaging. From the repository root, create the destination version directory and package the single runnable file with Python's `zipfile` command (or equivalent), then refresh the manifest and this index. Do not package dependency folders, personal learner exports or browser data.
