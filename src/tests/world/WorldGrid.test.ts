import { describe, expect, it } from 'vitest';
import { biomeWeightsFor } from '../../biomes/BiomeWeights';
import { WorldGrid } from '../../world/WorldGrid';
import { WorldSampler } from '../../world/WorldSampler';

describe('WorldGrid', () => {
  it('starts as an ocean with compact cell storage', () => {
    const world = new WorldGrid({ columns: 8, rows: 8, hexSize: 1, seed: 1, minElevation: -0.3, maxElevation: 3 });
    expect(world.count).toBe(64);
    expect(world.getCell(0).isLand).toBe(false);
  });

  it('reads and writes cells by axial coordinate', () => {
    const world = new WorldGrid({ columns: 8, rows: 8, hexSize: 1, seed: 1, minElevation: -0.3, maxElevation: 3 });
    const index = world.hexToIndex({ q: 0, r: 0 });
    expect(index).toBeDefined();

    world.setCell(index ?? 0, {
      isLand: true,
      elevation: 1.25,
      biomeWeights: biomeWeightsFor(2),
      moisture: 0.4,
      temperature: 0.8,
    });

    expect(world.getCell(index ?? 0).biomeWeights[2]).toBe(1);
  });

  it('samples land as a continuous height field', () => {
    const world = new WorldGrid({ columns: 8, rows: 8, hexSize: 1, seed: 1, minElevation: -0.3, maxElevation: 3 });
    const index = world.hexToIndex({ q: 0, r: 0 }) ?? 0;
    world.mutateCell(index, (cell) => ({ ...cell, isLand: true, elevation: 1 }));

    const sample = new WorldSampler(world).sample(0, 0);
    expect(sample.height).toBeGreaterThan(0);
    expect(sample.landAlpha).toBeGreaterThan(0.5);
  });
});
