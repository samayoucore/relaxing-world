# Relaxing World

Relaxing World is a cozy browser-based 3D world-building sandbox. The player starts with an empty ocean and paints a stylized continent with hex-shaped tools while the rendered terrain remains a continuous surface.

## Current Status

MVP foundation and first playable slice: Vite, strict TypeScript, Babylon.js scene, continuous chunked terrain, hex brush editing, four biomes, fallback object placement, undo/redo, local saves, JSON export/import, unit tests, and smoke-test scaffolding.

## Requirements

- Node.js 22 or newer
- npm
- A browser with WebGL 2 support

## Install

```bash
npm install
```

## Run

```bash
npm run dev
```

Open the local URL printed by Vite.

## Build and Checks

```bash
npm run typecheck
npm run lint
npm run test
npm run build
npm run test:e2e
```

`npm run check` runs typecheck, lint, unit tests, and production build.

## Controls

- Left mouse: paint with the active tool.
- Mouse drag on empty space / Babylon camera controls: orbit the world.
- Mouse wheel: zoom.
- Toolbar: choose Land, Height, Smooth, Biomes, Objects, Erase.
- Brush panel: radius, strength, biome, object, scatter density, add/remove mode.
- Top bar: new world, save, load, export, import, undo, redo, settings.

## Project Structure

- `src/hex`: axial coordinates and brush interpolation helpers.
- `src/world`: typed-array world data and global terrain sampler.
- `src/biomes`: biome ids, registry, and weight normalization.
- `src/brushes`: editing tools over domain state.
- `src/history`: command-pattern undo/redo.
- `src/persistence`: save schema, validation, IndexedDB, JSON export/import.
- `src/terrain`: chunk mesh generation and dirty updates.
- `src/rendering`: water, sky, post-processing, and object rendering.
- `src/engine`: Babylon engine, scene, camera, picking, lighting, diagnostics.
- `src/ui`: DOM interface.
- `src/app`: lifecycle and application coordination.

## Adding a Biome

Add the biome to `src/biomes/BiomeId.ts`, define display metadata and colors in `src/biomes/BiomeRegistry.ts`, update the fixed biome weight tuple handling, then add or update tests for normalization and painting behavior.

## Adding a Model

Use `ASSET_PIPELINE.md`. Models must be stored under `public/assets`, registered in `public/assets/manifest.json`, and attributed in `ATTRIBUTIONS.md`.

## Asset Licensing

Prefer CC0 or public domain assets. Do not use non-commercial, editorial-only, unknown-license, protected-character, or extracted game assets.

## Performance Notes

The MVP uses chunked terrain meshes, typed arrays for cell state, dirty flags, and instanced fallback objects. Worker-based terrain generation, LOD, and compressed assets are planned after visual correctness is established.

## Known Limitations

- Real GLB models are not included yet.
- Rivers are planned but not implemented in the MVP slice.
- Terrain generation is still on the main thread.
- Mobile-specific UI is not complete.
- The Asset Viewer is documented but deferred.

## Roadmap

1. Add the Asset Viewer and first CC0 GLB asset pack.
2. Move terrain mesh generation into a Web Worker.
3. Add spline river drawing and save/undo support.
4. Add quality profiles, LOD, and deeper profiling.
5. Expand Playwright tests for save/import/object workflows.
