# Catalogue review evidence

The `v8/` through `v12/` directories preserve research sources, assessment decisions, change records, verification and historical review scripts from the original `.catalogue-v*` workspaces. Contents are frozen evidence; moving them did not reassess any course.

Original script paths and embedded references are intentionally preserved. They are not supported one-command rebuilds from this new location. To reconstruct the original layout, use Git checkpoint `182e18c` in an isolated checkout. For current workbook imports, use the [catalogue maintenance guide](../README.md).

Intermediate workbooks, cached before-snapshots, rendered previews, logs and dependency folders are retained locally under `.work/catalogue/` and excluded from Git. The [migration inventory](../../docs/inventory-2026-11-01.json) records their original and new locations. Final historical workbooks are versioned in [archive/catalogues](../../archive/catalogues/).
