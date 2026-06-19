import type { HexCoordinates } from './HexCoordinates';
import { hexAdd, hexNeighbor, hexScale } from './HexMath';

export const hexesInRadius = (center: HexCoordinates, radius: number): HexCoordinates[] => {
  const result: HexCoordinates[] = [];

  for (let q = -radius; q <= radius; q += 1) {
    const minR = Math.max(-radius, -q - radius);
    const maxR = Math.min(radius, -q + radius);

    for (let r = minR; r <= maxR; r += 1) {
      result.push({ q: center.q + q, r: center.r + r });
    }
  }

  return result;
};

export const hexRing = (center: HexCoordinates, radius: number): HexCoordinates[] => {
  if (radius === 0) {
    return [center];
  }

  const results: HexCoordinates[] = [];
  let hex = hexAdd(center, hexScale({ q: -1, r: 1 }, radius));

  for (let side = 0; side < 6; side += 1) {
    for (let step = 0; step < radius; step += 1) {
      results.push(hex);
      hex = hexNeighbor(hex, side);
    }
  }

  return results;
};
