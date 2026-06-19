import { describe, expect, it } from 'vitest';
import { ObjectPlacementSystem } from '../../objects/ObjectPlacementSystem';

describe('ObjectPlacementSystem', () => {
  it('samples scatter height for every generated object position', () => {
    const objects = new ObjectPlacementSystem();
    const placed = objects.scatter(
      'tree',
      { x: 1, y: 0.5, z: -1 },
      4,
      6,
      123,
      (x, z) => x * 0.5 + z * 0.25,
    );

    expect(placed).toHaveLength(6);

    for (const object of placed) {
      expect(object.y).toBeCloseTo(object.x * 0.5 + object.z * 0.25, 6);
    }
  });

  it('keeps center height when no surface sampler is provided', () => {
    const objects = new ObjectPlacementSystem();
    const placed = objects.scatter('rock', { x: 0, y: 2.25, z: 0 }, 3, 4, 321);

    expect(placed.every((object) => object.y === 2.25)).toBe(true);
  });
});
