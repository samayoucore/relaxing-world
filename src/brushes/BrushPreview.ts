import { Color3 } from '@babylonjs/core/Maths/math.color';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import type { LinesMesh } from '@babylonjs/core/Meshes/linesMesh';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import type { Scene } from '@babylonjs/core/scene';
import type { HexCoordinates } from '../hex/HexCoordinates';
import { axialToWorld, hexCorners } from '../hex/HexLayout';
import { hexesInRadius } from '../hex/HexRange';
import { worldLayoutFromConfig, type WorldConfig } from '../world/WorldConfig';

export class BrushPreview {
  private mesh: LinesMesh | undefined;

  public constructor(
    private readonly scene: Scene,
    private readonly config: WorldConfig,
  ) {}

  public update(center: HexCoordinates, radius: number): void {
    this.mesh?.dispose();
    const layout = worldLayoutFromConfig(this.config);
    const lines: Vector3[][] = [];

    for (const hex of hexesInRadius(center, radius)) {
      const world = axialToWorld(hex, layout);
      const corners = hexCorners(world, layout.size * 0.96);
      const points = corners.map((corner) => new Vector3(corner.x, 0.09, corner.z));
      const first = points[0];

      if (first) {
        points.push(first.clone());
      }

      lines.push(points);
    }

    this.mesh = MeshBuilder.CreateLineSystem('brush-preview', { lines, updatable: false }, this.scene);
    this.mesh.color = new Color3(0.98, 0.95, 0.78);
    this.mesh.alpha = 0.86;
    this.mesh.isPickable = false;
  }

  public hide(): void {
    this.mesh?.dispose();
    this.mesh = undefined;
  }
}
