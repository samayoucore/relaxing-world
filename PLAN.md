# Relaxing World Implementation Plan

## Current Stage

The repository starts from an empty workspace. The first delivery is a working MVP slice that proves the architecture and keeps the project runnable after the turn:

1. Foundation: Vite, TypeScript strict mode, Babylon.js, linting, formatting, Vitest, Playwright, documentation, loading/error UI.
2. Visual prototype: ocean, sky, fog, soft lighting, shadow-capable scene, a small editable island surface, fallback primitives for trees, rocks, and houses.
3. Hex editing: axial coordinates, brush radius, land/erase, height, smooth, biome paint, brush preview, stroke interpolation.
4. Continuous terrain: chunked dense meshes generated from a global sampler over hex data, deterministic shared boundaries, local dirty updates.
5. Objects and persistence: instanced fallback objects, object placement/scatter/erase, undo/redo, save/load, JSON export/import.
6. Verification: typecheck, lint, unit tests, production build, Playwright smoke test when the browser runtime is available.

## Definition of Ready for This Pass

- The app opens locally with `npm run dev`.
- The canvas renders a WebGL 2 Babylon scene.
- The player can rotate, pan, and zoom the camera.
- The player can paint land, change brush size, modify height, smooth terrain, paint four biomes, place fallback objects, undo/redo, save/load, and export/import JSON.
- Domain logic is covered by focused unit tests.
- The repo has a clear next-step roadmap for deeper rendering polish, GLB assets, rivers, workers, and performance profiling.

## Later Stages

- Move terrain mesh array generation into a Web Worker after the main-thread implementation is visually verified.
- Add real CC0 GLB assets through the asset manifest and attribution flow.
- Replace fallback river planning with spline river meshes and terrain depression.
- Add an Asset Viewer route for manifest models.
- Add quality profiles, LOD, compressed textures, and deeper Playwright workflows.
