import { clamp } from '../utils/MathUtils';
import { BIOME_COUNT, type BiomeWeights } from './BiomeId';

export const DEFAULT_BIOME_WEIGHTS: BiomeWeights = [1, 0, 0, 0];

export const normalizeBiomeWeights = (weights: readonly number[]): BiomeWeights => {
  const clamped = Array.from({ length: BIOME_COUNT }, (_, index) => clamp(weights[index] ?? 0, 0, 1));
  const total = clamped.reduce((sum, value) => sum + value, 0);

  if (total <= 0.000_001) {
    return DEFAULT_BIOME_WEIGHTS;
  }

  const [grass = 0, forest = 0, sand = 0, snow = 0] = clamped;

  return [
    grass / total,
    forest / total,
    sand / total,
    snow / total,
  ];
};

export const biomeWeightsFor = (biomeIndex: number): BiomeWeights => {
  const weights = [0, 0, 0, 0];
  weights[biomeIndex] = 1;
  return normalizeBiomeWeights(weights);
};

export const blendBiomeWeight = (
  current: BiomeWeights,
  biomeIndex: number,
  amount: number,
): BiomeWeights => {
  const target = biomeWeightsFor(biomeIndex);
  return normalizeBiomeWeights(
    current.map((value, index) => value * (1 - amount) + (target[index] ?? 0) * amount),
  );
};
