export const BIOME_COUNT = 4;

export enum BiomeId {
  Grassland = 0,
  Forest = 1,
  Sand = 2,
  Snow = 3,
}

export type BiomeWeights = readonly [number, number, number, number];
