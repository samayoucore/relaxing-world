import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import type { Scene } from '@babylonjs/core/scene';
import { SEA_LEVEL } from '../world/WorldConfig';

export class WaterSystem {
  public constructor(scene: Scene, worldSize: number) {
    const water = MeshBuilder.CreateGround(
      'quiet-ocean',
      {
        width: worldSize * 2.5,
        height: worldSize * 2.5,
        subdivisions: 32,
      },
      scene,
    );
    water.position.y = SEA_LEVEL - 0.09;
    water.isPickable = false;

    const material = new StandardMaterial('quiet-ocean-material', scene);
    material.diffuseColor = new Color3(0.18, 0.48, 0.62);
    material.emissiveColor = new Color3(0.03, 0.12, 0.17);
    material.specularColor = new Color3(0.5, 0.74, 0.78);
    material.specularPower = 72;
    material.alpha = 0.88;
    material.backFaceCulling = false;
    water.material = material;
  }
}
