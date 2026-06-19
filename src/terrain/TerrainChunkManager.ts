import type { Scene } from '@babylonjs/core/scene';
import type { WorldSampler } from '../world/WorldSampler';
import { TerrainChunk } from './TerrainChunk';

export interface TerrainChunkConfig {
  worldSize: number;
  chunksPerSide: number;
  segmentsPerChunk: number;
}

export class TerrainChunkManager {
  private readonly chunks: TerrainChunk[] = [];
  private sampler: WorldSampler;

  public constructor(
    scene: Scene,
    sampler: WorldSampler,
    private readonly config: TerrainChunkConfig,
  ) {
    this.sampler = sampler;
    const material = TerrainChunk.createMaterial(scene);
    const chunkSize = config.worldSize / config.chunksPerSide;
    const min = -config.worldSize / 2;

    for (let row = 0; row < config.chunksPerSide; row += 1) {
      for (let column = 0; column < config.chunksPerSide; column += 1) {
        this.chunks.push(
          new TerrainChunk(
            `${column}-${row}`,
            {
              minX: min + column * chunkSize,
              minZ: min + row * chunkSize,
              size: chunkSize,
            },
            scene,
            material,
          ),
        );
      }
    }
  }

  public setSampler(sampler: WorldSampler): void {
    this.sampler = sampler;
    this.markAllDirty();
  }

  public markAllDirty(): void {
    for (const chunk of this.chunks) {
      chunk.dirty = true;
    }
  }

  public markAround(x: number, z: number, radius: number): void {
    for (const chunk of this.chunks) {
      if (chunk.intersectsCircle(x, z, radius)) {
        chunk.dirty = true;
      }
    }
  }

  public rebuildDirty(): number {
    const started = performance.now();

    for (const chunk of this.chunks) {
      if (chunk.dirty) {
        chunk.rebuild(this.config.segmentsPerChunk, this.sampler);
      }
    }

    return performance.now() - started;
  }

  public dirtyCount(): number {
    return this.chunks.filter((chunk) => chunk.dirty).length;
  }

  public meshCount(): number {
    return this.chunks.length;
  }
}
