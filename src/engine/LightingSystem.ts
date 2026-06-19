import { DirectionalLight } from '@babylonjs/core/Lights/directionalLight';
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight';
import { ShadowGenerator } from '@babylonjs/core/Lights/Shadows/shadowGenerator';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import type { AbstractMesh } from '@babylonjs/core/Meshes/abstractMesh';
import type { Scene } from '@babylonjs/core/scene';

export class LightingSystem {
  private readonly shadowGenerator: ShadowGenerator;

  public constructor(scene: Scene) {
    const ambient = new HemisphericLight('soft-ambient', new Vector3(0, 1, 0), scene);
    ambient.intensity = 0.74;
    ambient.groundColor = new Color3(0.42, 0.52, 0.5);

    const sun = new DirectionalLight('warm-sun', new Vector3(-0.55, -0.86, 0.32), scene);
    sun.position = new Vector3(42, 70, -38);
    sun.intensity = 1.52;
    sun.diffuse = new Color3(1, 0.92, 0.78);
    sun.specular = new Color3(0.65, 0.72, 0.78);

    this.shadowGenerator = new ShadowGenerator(2048, sun);
    this.shadowGenerator.useBlurExponentialShadowMap = true;
    this.shadowGenerator.blurKernel = 18;
    this.shadowGenerator.bias = 0.000_45;
    this.shadowGenerator.normalBias = 0.035;
  }

  public addCaster(mesh: AbstractMesh): void {
    this.shadowGenerator.addShadowCaster(mesh, true);
  }
}
