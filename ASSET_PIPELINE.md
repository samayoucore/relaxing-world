# Asset Pipeline

## Adding a Model

1. Verify the license.
2. Save the author name and source URL.
3. Download the model.
4. Open it in Blender.
5. Inspect geometry.
6. Remove invisible or unnecessary elements.
7. Apply transforms.
8. Set the origin intentionally.
9. Check scale against the game units.
10. Merge unnecessary materials.
11. Check UVs.
12. Reduce textures to a reasonable size.
13. Create LODs when the model will appear often or far from the camera.
14. Export to GLB.
15. Place the file in `public/assets`.
16. Add an entry to `public/assets/manifest.json`.
17. Add an entry to `ATTRIBUTIONS.md`.
18. Check the model in the Asset Viewer before using it in gameplay.

## Asset Viewer Roadmap

The MVP keeps fallback primitives in code. The next asset-focused stage should add a development Asset Viewer with:

- model selection from the manifest;
- orbit camera;
- bounding box;
- mesh, material, and triangle counts;
- wireframe toggle;
- shadow toggle;
- scale control;
- origin check;
- lighting presets.

## Blender Batch Script Roadmap

A later `scripts/blender_prepare_assets.py` should apply transforms, remove unused data blocks, normalize material names, and export selected objects to GLB. Aggressive decimation should stay manual until the result is visually checked.
