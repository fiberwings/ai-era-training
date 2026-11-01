# Release packages

Version-labelled standalone distributions, packaged on 1 November 2026 from the unchanged current app artifacts:

| Package | Contents |
| --- | --- |
| [Training Planner 2.0.8](training-planner/2.0.8/Training-Planner.zip) | `Training-Planner.html`; catalogue v12 and both retained starter formats. |
| [My AI Learning Path 1.3.1](learning-path/1.3.1/My-AI-Learning-Path.zip) | `index.html`; catalogue v12 and the retained Draft central pathway. |

Both files can be opened locally after extraction. They need no neighbouring runtime files. Keep the existing app location/origin when replacing a copy, and export JSON backups before transferring plans. Source remains in [training-planner](../training-planner/README.md) and [learning-path](../learning-path/README.md), not in these ZIPs.

[Manifest](manifest.json) records package/member hashes and source identities. App release dates remain 31 October 2026 because app behaviour and embedded data did not change. The 1 November date is the packaging/reorganisation date.

The previous ZIP and Windows update kit contained planner 2.0.6 and are in [archive](../archive/releases/planner-2.0.6/). The old v8 package is also archived. No current Windows update kit is published by this reorganisation; use the current repository and catalogue guide for maintenance.

After an intentional release update, rebuild and verify the apps before packaging. From the repository root, create the destination version directory and package the single runnable file with Python's `zipfile` command (or equivalent), then refresh the manifest and this index. Do not package dependency folders, personal learner exports or browser data.
