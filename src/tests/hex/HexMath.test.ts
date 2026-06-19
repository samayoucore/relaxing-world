import { describe, expect, it } from 'vitest';
import type { HexCoordinates } from '../../hex/HexCoordinates';
import { axialToWorld, worldToAxial } from '../../hex/HexLayout';
import { axialRound, cubeRound, hexDistance } from '../../hex/HexMath';
import { hexLine, interpolateBrushCells } from '../../hex/HexLine';
import { hexesInRadius } from '../../hex/HexRange';

describe('hex coordinates', () => {
  it('round-trips axial coordinates through world positions', () => {
    const hexes: HexCoordinates[] = [
      { q: 0, r: 0 },
      { q: 3, r: -2 },
      { q: -5, r: 4 },
    ];

    for (const hex of hexes) {
      expect(axialRound(worldToAxial(axialToWorld(hex)))).toEqual(hex);
    }
  });

  it('rounds cube coordinates while preserving q + r + s = 0', () => {
    const rounded = cubeRound({ q: 0.62, r: -1.12, s: 0.5 });
    expect(rounded.q + rounded.r + rounded.s).toBe(0);
  });

  it('calculates distance, radius cells, and lines', () => {
    expect(hexDistance({ q: 0, r: 0 }, { q: 3, r: -1 })).toBe(3);
    expect(hexesInRadius({ q: 0, r: 0 }, 2)).toHaveLength(19);
    expect(hexLine({ q: 0, r: 0 }, { q: 3, r: -1 })).toHaveLength(4);
  });

  it('interpolates brush strokes without duplicate cells', () => {
    const cells = interpolateBrushCells({ q: 0, r: 0 }, { q: 2, r: 0 }, 1);
    const keys = new Set(cells.map((hex) => `${hex.q},${hex.r}`));
    expect(keys.size).toBe(cells.length);
    expect(cells.length).toBeGreaterThan(7);
  });
});
