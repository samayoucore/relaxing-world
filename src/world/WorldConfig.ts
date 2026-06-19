import type { HexLayout } from '../hex/HexLayout';

export const SEA_LEVEL = 0;

export interface WorldConfig {
  columns: number;
  rows: number;
  hexSize: number;
  seed: number;
  maxElevation: number;
  minElevation: number;
}

export const DEFAULT_WORLD_CONFIG: WorldConfig = {
  columns: 96,
  rows: 96,
  hexSize: 1,
  seed: 12_345,
  maxElevation: 3.2,
  minElevation: -0.3,
};

export const worldLayoutFromConfig = (config: WorldConfig): HexLayout => ({
  size: config.hexSize,
  originX: 0,
  originZ: 0,
});
