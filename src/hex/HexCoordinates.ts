export interface HexCoordinates {
  q: number;
  r: number;
}

export interface FractionalHexCoordinates {
  q: number;
  r: number;
}

export interface CubeCoordinates {
  q: number;
  r: number;
  s: number;
}

export const HEX_DIRECTIONS: readonly HexCoordinates[] = Object.freeze([
  { q: 1, r: 0 },
  { q: 1, r: -1 },
  { q: 0, r: -1 },
  { q: -1, r: 0 },
  { q: -1, r: 1 },
  { q: 0, r: 1 },
]);
