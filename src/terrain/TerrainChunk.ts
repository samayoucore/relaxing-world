import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import type { Scene } from '@babylonjs/core/scene';
import type { WorldSampler } from '../world/WorldSampler';
import { TerrainMeshBuilder, type TerrainChunkBounds } from './TerrainMeshBuilder';

export class TerrainChunk {
  public readonly mesh: Mesh;
  public dirty = true;
  private readonly builder = new TerrainMeshBuilder();

  public constructor(
    public readonly id: string,
    public readonly bounds: TerrainChunkBounds,
    scene: Scene,
    material: StandardMaterial,
  ) {
    this.mesh = new Mesh(`terrain-${id}`, scene);
    this.mesh.material = material;
    this.mesh.receiveShadows = true;
    this.mesh.isPickable = false;
  }

  public rebuild(segments: number, sampler: WorldSampler): void {
    const data = this.builder.build(this.bounds, segments, sampler);
    data.vertexData.applyToMesh(this.mesh, true);
    this.mesh.refreshBoundingInfo();
    this.dirty = false;
  }

  public intersectsCircle(x: number, z: number, radius: number): boolean {
    const nearestX = Math.max(this.bounds.minX, Math.min(x, this.bounds.minX + this.bounds.size));
    const nearestZ = Math.max(this.bounds.minZ, Math.min(z, this.bounds.minZ + this.bounds.size));
    return Math.hypot(x - nearestX, z - nearestZ) <= radius;
  }

  public static createMaterial(scene: Scene): StandardMaterial {
    const material = new StandardMaterial('terrain-vertex-material', scene);
    material.diffuseColor = Color3.White();
    material.specularColor = new Color3(0.08, 0.09, 0.08);
    material.emissiveColor = new Color3(0.01, 0.015, 0.012);
    return material;
  }
}
