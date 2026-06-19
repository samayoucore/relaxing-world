import { describe, expect, it } from 'vitest';
import { DEFAULT_BRUSH_SETTINGS } from '../../brushes/Brush';
import { BrushManager } from '../../brushes/BrushManager';
import { ObjectPlacementSystem } from '../../objects/ObjectPlacementSystem';
import { JsonExportService } from '../../persistence/JsonExportService';
import { WorldDeserializer } from '../../persistence/WorldDeserializer';
import { WorldSerializer } from '../../persistence/WorldSerializer';
import { WorldGrid } from '../../world/WorldGrid';

describe('WorldSerializer', () => {
  it('serializes, validates, and deserializes world data', () => {
    const world = new WorldGrid({ columns: 8, rows: 8, hexSize: 1, seed: 1, minElevation: -0.3, maxElevation: 3 });
    const objects = new ObjectPlacementSystem();
    new BrushManager().applyCellBrush(world, { q: 0, r: 0 }, { ...DEFAULT_BRUSH_SETTINGS, radius: 0 });
    objects.add({ definitionId: 'tree', x: 0, y: 0, z: 0, rotationY: 0, scale: 1 });

    const save = WorldSerializer.serialize(world, objects, 'Test World');
    const parsed = JsonExportService.parse(JsonExportService.stringify(save));
    const restoredObjects = new ObjectPlacementSystem();
    const restored = WorldDeserializer.apply(parsed, restoredObjects);

    expect(WorldSerializer.validate(save)).toBe(true);
    expect(restored.getCell(world.hexToIndex({ q: 0, r: 0 }) ?? 0).isLand).toBe(true);
    expect(restoredObjects.count()).toBe(1);
  });

  it('rejects malformed save imports', () => {
    expect(() => JsonExportService.parse('{"schemaVersion":999}')).toThrow();
  });
});
