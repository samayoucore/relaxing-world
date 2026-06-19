# Development Rules

- TypeScript runs in strict mode.
- Do not use `any` except for isolated cases with a written reason.
- Do not create monolithic classes.
- Do not mix game state, rendering, and DOM UI responsibilities.
- After changes, run typecheck, unit tests, and production build.
- After gameplay mechanic changes, add or update tests.
- Do not leave the project in a broken state.
- Do not add large production dependencies without necessity.
- Do not load assets with unclear licenses.
- Prefer CC0 assets.
- Register all external assets in the manifest and `ATTRIBUTIONS.md`.
- Do not load external models or textures directly by URL at runtime.
- Store all game assets locally inside `public/assets`.
- Do not copy source code, assets, or UI from other games.
- Make safe technical assumptions independently and document them.
- Do not block work with questions when a safe reasonable decision is available.
- Implement a clear correct version first, then optimize it.
- At the end of each stage the project must run and be available for manual verification.
