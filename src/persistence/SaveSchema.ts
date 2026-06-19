import type { WorldConfig } from '../world/WorldConfig';
import type { WorldObject } from '../objects/WorldObject';

export const SAVE_SCHEMA_VERSION = 1;

export interface SaveCells {
  landFlags: readonly number[];
  elevations: readonly number[];
  biomeWeights: readonly number[];
  moisture: readonly number[];
  temperature: readonly number[];
}

export interface SaveFile {
  schemaVersion: number;
  gameVersion: string;
  createdAt: string;
  updatedAt: string;
  worldName: string;
  worldConfig: WorldConfig;
  seed: number;
  cells: SaveCells;
  objects: readonly WorldObject[];
  rivers: readonly unknown[];
}
