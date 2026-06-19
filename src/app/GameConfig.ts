import { DEFAULT_WORLD_CONFIG, type WorldConfig } from '../world/WorldConfig';

export interface GameConfig {
  world: WorldConfig;
  terrainWorldSize: number;
  terrainChunksPerSide: number;
  terrainSegmentsPerChunk: number;
}

export const DEFAULT_GAME_CONFIG: GameConfig = {
  world: DEFAULT_WORLD_CONFIG,
  terrainWorldSize: 150,
  terrainChunksPerSide: 5,
  terrainSegmentsPerChunk: 30,
};
