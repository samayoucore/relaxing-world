import type { HexCoordinates } from './HexCoordinates';
import { axialRound, axialToCube, cubeLerp, hexDistance, hexKey } from './HexMath';
import { hexesInRadius } from './HexRange';

export const hexLine = (start: HexCoordinates, end: HexCoordinates): HexCoordinates[] => {
  const distance = hexDistance(start, end);
  const startCube = axialToCube(start);
  const endCube = axialToCube(end);
  const results: HexCoordinates[] = [];

  for (let index = 0; index <= distance; index += 1) {
    const amount = distance === 0 ? 0 : index / distance;
    results.push(axialRound(cubeLerp(startCube, endCube, amount)));
  }

  return results;
};

export const interpolateBrushCells = (
  start: HexCoordinates,
  end: HexCoordinates,
  radius: number,
): HexCoordinates[] => {
  const keys = new Set<string>();
  const results: HexCoordinates[] = [];

  for (const center of hexLine(start, end)) {
    for (const hex of hexesInRadius(center, radius)) {
      const key = hexKey(hex);

      if (!keys.has(key)) {
        keys.add(key);
        results.push(hex);
      }
    }
  }

  return results;
};
