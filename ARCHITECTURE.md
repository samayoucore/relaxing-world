# Architecture

Relaxing World is split into four layers.

## Domain Layer

The domain layer owns the truth of the world: hex cells, elevations, biome weights, object records, commands, save data, and deterministic random helpers. It has no dependency on Babylon.js or the DOM. Dense arrays are used for cell state so a 96 x 96 map remains compact and predictable.

## Application Layer

The application layer coordinates the active tool, command history, persistence, UI events, and renderer updates. It translates pointer input into domain commands and marks affected terrain chunks dirty.

## Rendering Layer

Rendering is Babylon.js-based and treats domain data as source input. Terrain is displayed as continuous rectangular chunks generated from a global sampler over the logical hex grid. The visual surface is not one mesh per hex cell, which keeps the world from looking like separated platforms and avoids material churn.

## UI Layer

The UI is plain DOM and CSS. It exposes tools, brush controls, object/biome selectors, save/load/export/import, undo/redo, and diagnostics. UI events call application methods; they do not mutate Babylon meshes directly.

## Intentional Deviations From the Proposed File Tree

This first implementation creates the modules needed for a working MVP slice instead of filling every proposed file with placeholders. Empty architectural shells are avoided. Additional systems from the proposed tree should be added when they have concrete behavior and tests.

## Terrain Decision

Terrain chunks are rectangular technical meshes. Vertices are positioned in global XZ coordinates, and height/biome values are sampled through `WorldSampler`. Adjacent chunks compute matching boundary positions from the same formula, preventing cracks from accumulated floating-point offsets.

The first pass builds mesh data on the main thread because the terrain size is small and correctness is more important than premature worker complexity. `terrain.worker.ts` is intentionally deferred until profiling shows mesh generation cost that justifies transferables.

## Assets

The MVP uses generated fallback primitives for trees, rocks, and houses. No external game assets are copied. Future GLB models must be local under `public/assets`, listed in `public/assets/manifest.json`, and attributed in `ATTRIBUTIONS.md`.
