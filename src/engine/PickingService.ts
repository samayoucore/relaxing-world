import '@babylonjs/core/Culling/ray';
import type { Camera } from '@babylonjs/core/Cameras/camera';
import { Matrix, Vector3 } from '@babylonjs/core/Maths/math.vector';
import type { Scene } from '@babylonjs/core/scene';

export class PickingService {
  public constructor(
    private readonly scene: Scene,
    private readonly camera: Camera,
  ) {}

  public pickSeaPlane(
    clientX: number,
    clientY: number,
    canvas: HTMLCanvasElement,
  ): Vector3 | undefined {
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const ray = this.scene.createPickingRay(x, y, Matrix.Identity(), this.camera, false);

    if (Math.abs(ray.direction.y) < 0.000_01) {
      return undefined;
    }

    const distance = -ray.origin.y / ray.direction.y;

    if (distance < 0) {
      return undefined;
    }

    return ray.origin.add(ray.direction.scale(distance));
  }
}
