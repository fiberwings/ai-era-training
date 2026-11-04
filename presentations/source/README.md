# Presentation source history

These folders preserve authoring sources and validation for the live PowerPoint deliverables. The `needs-map/` folder relates to the capability-needs deck. The `capability-model-*` folders record the original briefing and successive appendix/editorial updates.

Scripts, source decks, assets and JSON audit records are preserved as historical source material. They contain original absolute paths, `.presentation-build/` paths and `outputs/` destinations, and some require the authoring runtime used at the time. They are not current automated build entry points. Use Git checkpoint `182e18c` for the original layout, or deliberately port the required step for a future presentation-editing task; do not run an old pipeline against today's catalogue and overwrite the live deck inadvertently.

`capability-model-catalogue-20261018/source-counts.json` identifies catalogue v10 as the appendix source. The live decks in the parent directory are the current editable files. Rendered previews, inspected intermediate packages and duplicate working decks are retained locally under `.work/presentations/`.

## Subsequent additions

[next-steps-20261102](next-steps-20261102/) contains the source and validation for the additional nine-slide Group CISO walkthrough created on 2 November 2026. This is separate from the historical authoring chain above.

[framework-training-decisions-20261104](framework-training-decisions-20261104/) contains the source and verification for the seven-slide framework introduction created on 4 November 2026, since replaced; the deck itself is retained in commit `d3769e1`. It adapts the briefing's slide objects and links components, needs, domains and training decisions.

[cyber-workforce-pack-20261104](cyber-workforce-pack-20261104/) contains the source, app screenshot and verification for the 21-slide cyber workforce preparation pack that replaced it on 4 November 2026.
