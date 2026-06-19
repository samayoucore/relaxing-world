import { BiomeId } from '../biomes/BiomeId';

export type BrushTool = 'land' | 'height' | 'smooth' | 'biome' | 'object' | 'erase';
export type BrushMode = 'add' | 'remove';
export type BrushFalloff = 'linear' | 'smooth';

export interface BrushSettings {
  tool: BrushTool;
  radius: number;
  strength: number;
  falloff: BrushFalloff;
  biomeId: BiomeId;
  objectDefinitionId: string;
  scatterDensity: number;
  mode: BrushMode;
}

export const DEFAULT_BRUSH_SETTINGS: BrushSettings = {
  tool: 'land',
  radius: 2,
  strength: 0.65,
  falloff: 'smooth',
  biomeId: BiomeId.Grassland,
  objectDefinitionId: 'tree',
  scatterDensity: 4,
  mode: 'add',
};
