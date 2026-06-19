import type { FractionalHexCoordinates, HexCoordinates } from './HexCoordinates';

const SQRT_3 = Math.sqrt(3);

export interface WorldPoint {
  x: number;
  z: number;
}

export interface HexLayout {
  size: number;
  originX: number;
  originZ: number;
}

export const DEFAULT_HEX_LAYOUT: HexLayout = {
  size: 1,
  originX: 0,
  originZ: 0,
};

export const axialToWorld = (hex: HexCoordinates, layout: HexLayout = DEFAULT_HEX_LAYOUT): WorldPoint => ({
  x: layout.originX + layout.size * SQRT_3 * (hex.q + hex.r / 2),
  z: layout.originZ + layout.size * 1.5 * hex.r,
});

export const worldToAxial = (point: WorldPoint, layout: HexLayout = DEFAULT_HEX_LAYOUT): FractionalHexCoordinates => {
  const x = (point.x - layout.originX) / layout.size;
  const z = (point.z - layout.originZ) / layout.size;

  return {
    q: (SQRT_3 / 3) * x - z / 3,
    r: (2 / 3) * z,
  };
};

export const hexCorners = (center: WorldPoint, size: number): readonly WorldPoint[] => {
  const corners: WorldPoint[] = [];

  for (let index = 0; index < 6; index += 1) {
    const angle = (Math.PI / 180) * (60 * index - 30);
    corners.push({
      x: center.x + size * Math.cos(angle),
      z: center.z + size * Math.sin(angle),
    });
  }

  return corners;
};
