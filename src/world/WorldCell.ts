import type { BiomeWeights } from '../biomes/BiomeId';

export interface WorldCellData {
  isLand: boolean;
  elevation: number;
  biomeWeights: BiomeWeights;
  moisture: number;
  temperature: number;
}

export interface CellSnapshot extends WorldCellData {
  index: number;
}
