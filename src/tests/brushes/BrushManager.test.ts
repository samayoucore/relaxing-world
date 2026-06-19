import { describe, expect, it } from 'vitest';
import { BiomeId } from '../../biomes/BiomeId';
import { DEFAULT_BRUSH_SETTINGS } from '../../brushes/Brush';
import { BrushManager } from '../../brushes/BrushManager';
import { WorldGrid } from '../../world/WorldGrid';

const smallWorld = (): WorldGrid =>
  new WorldGrid({ columns: 12, rows: 12, hexSize: 1, seed: 1, minElevation: -0.3, maxElevation: 3 });

describe('BrushManager', () => {
  it('paints land with a hex-shaped radius', () => {
    const world = smallWorld();
    const changes = new BrushManager().applyCellBrush(world, { q: 0, r: 0 }, { ...DEFAULT_BRUSH_SETTINGS, radius: 1 });
    expect(changes).toHaveLength(7);
    expect(world.getCell(changes[0]?.index ?? 0).isLand).toBe(true);
  });

  it('raises and lowers terrain height', () => {
    const world = smallWorld();
    const brush = new BrushManager();
    brush.applyCellBrush(world, { q: 0, r: 0 }, { ...DEFAULT_BRUSH_SETTINGS, radius: 0 });
    const index = world.hexToIndex({ q: 0, r: 0 }) ?? 0;
    const before = world.getCell(index).elevation;

    brush.applyCellBrush(world, { q: 0, r: 0 }, { ...DEFAULT_BRUSH_SETTINGS, tool: 'height', radius: 0 });
    expect(world.getCell(index).elevation).toBeGreaterThan(before);
  });

  it('blends biome weights and keeps them normalized', () => {
    const world = smallWorld();
    new BrushManager().applyCellBrush(world, { q: 0, r: 0 }, {
      ...DEFAULT_BRUSH_SETTINGS,
      tool: 'biome',
      radius: 0,
      strength: 0.75,
      biomeId: BiomeId.Forest,
    });
    const index = world.hexToIndex({ q: 0, r: 0 }) ?? 0;
    const weights = world.getCell(index).biomeWeights;
    const total = weights.reduce((sum, value) => sum + value, 0);
    expect(total).toBeCloseTo(1);
    expect(weights[BiomeId.Forest]).toBeGreaterThan(0.5);
  });
});
