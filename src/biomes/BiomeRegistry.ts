import { BiomeId } from './BiomeId';

export interface BiomeDefinition {
  id: BiomeId;
  label: string;
  color: readonly [number, number, number];
  uiColor: string;
}

const GRASSLAND_BIOME: BiomeDefinition = {
  id: BiomeId.Grassland,
  label: 'Grassland',
  color: [0.36, 0.64, 0.31],
  uiColor: '#6aa55b',
};

export const BIOMES: readonly BiomeDefinition[] = Object.freeze([
  GRASSLAND_BIOME,
  {
    id: BiomeId.Forest,
    label: 'Forest',
    color: [0.2, 0.43, 0.27],
    uiColor: '#3f7148',
  },
  {
    id: BiomeId.Sand,
    label: 'Sand',
    color: [0.76, 0.68, 0.45],
    uiColor: '#c9b66f',
  },
  {
    id: BiomeId.Snow,
    label: 'Snow',
    color: [0.82, 0.88, 0.88],
    uiColor: '#d6e3e2',
  },
]);

export const getBiomeDefinition = (id: BiomeId): BiomeDefinition => {
  const definition = BIOMES.find((biome) => biome.id === id);

  if (!definition) {
    return GRASSLAND_BIOME;
  }

  return definition;
};
