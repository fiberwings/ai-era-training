# Project inventory and reorganisation

1 November 2026. The user approved the structure and archive decisions below. Current entry points are in [README](../README.md); project rules are in [AGENTS.md](../AGENTS.md).

## Live deliverables

| Directory | Contents and status |
| --- | --- |
| [catalogue](../catalogue/README.md) | Current v12 workbook; preserved review evidence for v8–v12. |
| [capability-framework](../capability-framework/README.md) | Authoritative readable model and generated CSV crosswalk. |
| [training-planner](../training-planner/README.md) | Builder source, runnable HTML, tests, shared model/data, catalogue/scenario histories and QA evidence. Existing app path retained. |
| [learning-path](../learning-path/README.md) | Staff-app source, runnable HTML, tests and feedback importer. Existing app path retained. |
| [presentations](../presentations/README.md) | Both live PowerPoint decks; historical authoring scripts, source inputs and validation records. |

## Supporting directories

| Directory | Treatment |
| --- | --- |
| [analysis](../analysis/README.md) | Empty of previous reports; reserved for new active work. |
| [docs](PROJECT_CONTEXT.md) | Current context, inventory, verification, and frozen old handovers in `history/`. |
| [releases](../releases/README.md) | Version-labelled current standalone distributions and package hashes. |
| [archive](../archive/README.md) | Frozen reports, previous workbooks/models and older packages. |
| `.work/` | Local, Git-ignored scratch/intermediate files, duplicate working copies and render outputs. No files were deleted in this reorganisation. |

## Moves and decisions

| Previous location | New location / decision |
| --- | --- |
| Root v12 workbook | `catalogue/` — current catalogue. |
| Root v7, v8, v11 and `catalogue-archive/` v9/v10 | `archive/catalogues/` — historical workbooks. |
| Root duplicate v10 workbook | Exact duplicate confirmed by SHA-256; local copy retained in `.work/duplicates/`. One authoritative archived copy is tracked. |
| Root model and crosswalk | `capability-framework/` — current framework. Generator output paths and generated links updated. |
| `model-history/` | `archive/capability-framework/` — prior models unchanged. |
| `analysis/2027-training-plan/` | `archive/analysis/2027-training-plan/` — outdated, archived by user decision. Original scripts, scenarios, reports, packs and nested archives retained unchanged. |
| `analysis/foundation-review/` | `archive/analysis/foundation-review/` — no longer needed, archived by user decision. |
| `.foundation-revision/` | Archived annual-plan `support/foundation-revision/` — historical revision evidence. |
| Both `outputs/*.pptx` decks | `presentations/` — both live deliverables. File contents unchanged. |
| `.presentation-build/` | Source scripts, inputs/assets and JSON validation retained in `presentations/source/`; rendered/intermediate files in `.work/presentations/`. |
| `.catalogue-v8/` through `.catalogue-v12/` | Research, assessments, sources and scripts in `catalogue/evidence/v*/`; workbook/render/cache intermediates in `.work/catalogue/`. Historical evidence contents unchanged. |
| `outputs/Training-Planner*.zip` | `archive/releases/planner-2.0.6/` — embedded release identified as 2.0.6. |
| `delivery/AI-Era-Training-Planner-v8.zip` | `archive/releases/catalogue-v8/`. |
| Planner root screenshots and verification JSON | `training-planner/qa/screenshots/` and `qa/verification/`. |
| Root `PROJECT_CONTEXT.md` | Frozen at `docs/history/PROJECT_CONTEXT-2026-10-31.md`; current guidance is now `docs/PROJECT_CONTEXT.md`. |
| Previous root and planner READMEs | Frozen copies in `docs/history/`; live READMEs refreshed. |
| `.chart-data-*`, caches and OS files | `.work/` or existing ignored cache locations. |

Both app defaults, their JSON data, storage keys and runnable file paths remain unchanged, as explicitly requested after the initial proposal. Archiving the old reports does not change personal/browser plans or republish a new central pathway.

## Traceability

The local Git checkpoint before moving files is **`182e18c`**. It includes substantive previously uncommitted work and previously ignored source/research evidence. The reorganisation is a separate commit on `codex/reorganise-project`.

[Machine-readable inventory](inventory-2026-11-01.json) records each original project's file path, destination and original SHA-256, including local intermediate files. It distinguishes versioned files from ignored working copies and records final hashes for deliberately edited files. [Verification](VERIFICATION.md) records the completed checks.

Archives and historical source records deliberately retain their original bytes and embedded paths. Their original relative commands can be reconstructed at the Git checkpoint; current maintenance uses the live guides. Scratch copies remain local, so a fresh clone restores the versioned project rather than every old render/cache.
