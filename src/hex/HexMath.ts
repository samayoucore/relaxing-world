import { lerp } from '../utils/MathUtils';
import type { CubeCoordinates, FractionalHexCoordinates, HexCoordinates } from './HexCoordinates';
import { HEX_DIRECTIONS } from './HexCoordinates';

export const axialToCube = (hex: FractionalHexCoordinates): CubeCoordinates => ({
  q: hex.q,
  r: hex.r,
  s: -hex.q - hex.r,
});

export const cubeToAxial = (cube: CubeCoordinates): HexCoordinates => ({
  q: cube.q,
  r: cube.r,
});

export const cubeRound = (cube: CubeCoordinates): CubeCoordinates => {
  let q = Math.round(cube.q);
  let r = Math.round(cube.r);
  let s = Math.round(cube.s);

  const qDiff = Math.abs(q - cube.q);
  const rDiff = Math.abs(r - cube.r);
  const sDiff = Math.abs(s - cube.s);

  if (qDiff > rDiff && qDiff > sDiff) {
    q = -r - s;
  } else if (rDiff > sDiff) {
    r = -q - s;
  } else {
    s = -q - r;
  }

  return { q, r, s };
};

export const axialRound = (hex: FractionalHexCoordinates): HexCoordinates =>
  cubeToAxial(cubeRound(axialToCube(hex)));

export const hexAdd = (left: HexCoordinates, right: HexCoordinates): HexCoordinates => ({
  q: left.q + right.q,
  r: left.r + right.r,
});

export const hexSubtract = (left: HexCoordinates, right: HexCoordinates): HexCoordinates => ({
  q: left.q - right.q,
  r: left.r - right.r,
});

export const hexScale = (hex: HexCoordinates, factor: number): HexCoordinates => ({
  q: hex.q * factor,
  r: hex.r * factor,
});

export const hexNeighbor = (hex: HexCoordinates, direction: number): HexCoordinates => {
  const offset = HEX_DIRECTIONS[((direction % 6) + 6) % 6];

  if (!offset) {
    return hex;
  }

  return hexAdd(hex, offset);
};

export const hexDistance = (left: HexCoordinates, right: HexCoordinates): number => {
  const difference = hexSubtract(left, right);
  return (
    (Math.abs(difference.q) +
      Math.abs(difference.q + difference.r) +
      Math.abs(difference.r)) /
    2
  );
};

export const cubeLerp = (left: CubeCoordinates, right: CubeCoordinates, amount: number): CubeCoordinates => ({
  q: lerp(left.q, right.q, amount),
  r: lerp(left.r, right.r, amount),
  s: lerp(left.s, right.s, amount),
});

export const hexKey = (hex: HexCoordinates): string => `${hex.q},${hex.r}`;

export const sameHex = (left: HexCoordinates, right: HexCoordinates): boolean =>
  left.q === right.q && left.r === right.r;
