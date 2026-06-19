import { BIOME_COUNT, type BiomeWeights } from '../biomes/BiomeId';
import { normalizeBiomeWeights } from '../biomes/BiomeWeights';
import { axialRound, hexDistance } from '../hex/HexMath';
import { axialToWorld, worldToAxial } from '../hex/HexLayout';
import { hexesInRadius } from '../hex/HexRange';
import { clamp, lerp, smoothstep } from '../utils/MathUtils';
import type { WorldGrid } from './WorldGrid';
import { SEA_LEVEL, worldLayoutFromConfig } from './WorldConfig';

export interface TerrainSample {
  height: number;
  landAlpha: number;
  biomeWeights: BiomeWeights;
}

export class WorldSampler {
  public constructor(private readonly world: WorldGrid) {}

  public sample(x: number, z: number): TerrainSample {
    const layout = worldLayoutFromConfig(this.world.config);
    const fractional = worldToAxial({ x, z }, layout);
    const center = axialRound(fractional);
    const candidates = hexesInRadius(center, 2);
    let weightTotal = 0;
    let landWeight = 0;
    let elevationTotal = 0;
    const biomeTotals = Array.from({ length: BIOME_COUNT }, () => 0);

    for (const hex of candidates) {
      const index = this.world.hexToIndex(hex);

      if (index === undefined) {
        continue;
      }

      const cellCenter = axialToWorld(hex, layout);
      const distance = Math.hypot(x - cellCenter.x, z - cellCenter.z);
      const radial = clamp(1 - distance / (layout.size * 2.1), 0, 1);
      const gridDistance = hexDistance(center, hex);
      const gridWeight = clamp(1 - gridDistance / 3, 0.2, 1);
      const weight = radial * radial * gridWeight;

      if (weight <= 0) {
        continue;
      }

      const cell = this.world.getCell(index);
      weightTotal += weight;

      if (cell.isLand) {
        landWeight += weight;
        elevationTotal += weight * Math.max(0.18, cell.elevation);

        for (let biomeIndex = 0; biomeIndex < BIOME_COUNT; biomeIndex += 1) {
          biomeTotals[biomeIndex] =
            (biomeTotals[biomeIndex] ?? 0) + weight * (cell.biomeWeights[biomeIndex] ?? 0);
        }
      }
    }

    if (weightTotal <= 0) {
      return {
        height: SEA_LEVEL - 0.45,
        landAlpha: 0,
        biomeWeights: [1, 0, 0, 0],
      };
    }

    const alpha = smoothstep(0.06, 0.42, landWeight / weightTotal);
    const averageElevation = landWeight <= 0 ? 0 : elevationTotal / landWeight;
    const height = lerp(SEA_LEVEL - 0.45, SEA_LEVEL + averageElevation, alpha);

    return {
      height,
      landAlpha: alpha,
      biomeWeights: normalizeBiomeWeights(biomeTotals),
    };
  }
}
