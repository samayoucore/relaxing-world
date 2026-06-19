import type { HexCoordinates } from '../hex/HexCoordinates';
import type { WorldConfig } from './WorldConfig';

export const cellCount = (config: WorldConfig): number => config.columns * config.rows;

export const indexToHex = (index: number, config: WorldConfig): HexCoordinates => {
  const column = index % config.columns;
  const row = Math.floor(index / config.columns);

  return {
    q: column - Math.floor(config.columns / 2),
    r: row - Math.floor(config.rows / 2),
  };
};

export const hexToIndex = (hex: HexCoordinates, config: WorldConfig): number | undefined => {
  const column = hex.q + Math.floor(config.columns / 2);
  const row = hex.r + Math.floor(config.rows / 2);

  if (column < 0 || row < 0 || column >= config.columns || row >= config.rows) {
    return undefined;
  }

  return row * config.columns + column;
};

export const isHexInsideWorld = (hex: HexCoordinates, config: WorldConfig): boolean =>
  hexToIndex(hex, config) !== undefined;
