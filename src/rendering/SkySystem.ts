import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import type { Scene } from '@babylonjs/core/scene';

export class SkySystem {
  public constructor(scene: Scene, worldSize: number) {
    const skybox = MeshBuilder.CreateSphere(
      'procedural-skybox',
      {
        diameter: worldSize * 4,
        segments: 32,
        sideOrientation: Mesh.BACKSIDE,
      },
      scene,
    );
    skybox.isPickable = false;
    skybox.infiniteDistance = true;
    skybox.applyFog = false;

    const material = new StandardMaterial('procedural-sky-material', scene);
    material.backFaceCulling = false;
    material.disableLighting = true;
    material.diffuseColor = new Color3(0.66, 0.84, 0.94);
    material.emissiveColor = new Color3(0.66, 0.84, 0.94);
    material.specularColor = Color3.Black();
    skybox.material = material;
  }
}
