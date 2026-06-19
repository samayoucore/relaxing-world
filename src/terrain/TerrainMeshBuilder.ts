import { Color4 } from '@babylonjs/core/Maths/math.color';
import { VertexData } from '@babylonjs/core/Meshes/mesh.vertexData';
import { BIOMES } from '../biomes/BiomeRegistry';
import type { WorldSampler } from '../world/WorldSampler';

export interface TerrainChunkBounds {
  minX: number;
  minZ: number;
  size: number;
}

export interface TerrainMeshData {
  vertexData: VertexData;
}

export class TerrainMeshBuilder {
  public build(bounds: TerrainChunkBounds, segments: number, sampler: WorldSampler): TerrainMeshData {
    const positions: number[] = [];
    const indices: number[] = [];
    const normals: number[] = [];
    const colors: number[] = [];
    const step = bounds.size / segments;

    for (let row = 0; row <= segments; row += 1) {
      for (let column = 0; column <= segments; column += 1) {
        const x = bounds.minX + column * step;
        const z = bounds.minZ + row * step;
        const sample = sampler.sample(x, z);
        positions.push(x, sample.height, z);

        const color = this.colorFromSample(sample.biomeWeights, sample.landAlpha);
        colors.push(color.r, color.g, color.b, color.a);
      }
    }

    for (let row = 0; row < segments; row += 1) {
      for (let column = 0; column < segments; column += 1) {
        const topLeft = row * (segments + 1) + column;
        const topRight = topLeft + 1;
        const bottomLeft = topLeft + segments + 1;
        const bottomRight = bottomLeft + 1;
        indices.push(topLeft, bottomLeft, topRight);
        indices.push(topRight, bottomLeft, bottomRight);
      }
    }

    VertexData.ComputeNormals(positions, indices, normals);

    const vertexData = new VertexData();
    vertexData.positions = positions;
    vertexData.indices = indices;
    vertexData.normals = normals;
    vertexData.colors = colors;
    return { vertexData };
  }

  private colorFromSample(weights: readonly number[], landAlpha: number): Color4 {
    let r = 0;
    let g = 0;
    let b = 0;

    for (let index = 0; index < BIOMES.length; index += 1) {
      const biome = BIOMES[index];

      if (!biome) {
        continue;
      }

      const weight = weights[index] ?? 0;
      r += biome.color[0] * weight;
      g += biome.color[1] * weight;
      b += biome.color[2] * weight;
    }

    const coast = 1 - landAlpha;
    r = r * landAlpha + 0.62 * coast;
    g = g * landAlpha + 0.55 * coast;
    b = b * landAlpha + 0.37 * coast;

    return new Color4(r, g, b, 1);
  }
}
