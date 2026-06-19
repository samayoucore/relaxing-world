import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import '@babylonjs/core/Meshes/instancedMesh';
import type { InstancedMesh } from '@babylonjs/core/Meshes/instancedMesh';
import type { Mesh } from '@babylonjs/core/Meshes/mesh';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import type { Scene } from '@babylonjs/core/scene';
import type { LightingSystem } from '../engine/LightingSystem';
import type { WorldObject } from './WorldObject';

interface ObjectPrototype {
  meshes: readonly Mesh[];
}

export class ObjectRenderer {
  private readonly prototypes = new Map<string, ObjectPrototype>();
  private readonly instances: InstancedMesh[] = [];

  public constructor(
    private readonly scene: Scene,
    private readonly lighting: LightingSystem,
  ) {
    this.createPrototypes();
  }

  public rebuild(objects: readonly WorldObject[]): void {
    for (const instance of this.instances.splice(0)) {
      instance.dispose();
    }

    for (const object of objects) {
      const prototype = this.prototypes.get(object.definitionId) ?? this.prototypes.get('tree');

      if (!prototype) {
        continue;
      }

      for (const mesh of prototype.meshes) {
        const instance = mesh.createInstance(`${object.id}-${mesh.name}`);
        instance.position.set(object.x + mesh.position.x, object.y + mesh.position.y, object.z + mesh.position.z);
        instance.rotation.y = object.rotationY + mesh.rotation.y;
        instance.scaling.setAll(object.scale);
        this.instances.push(instance);
        this.lighting.addCaster(instance);
      }
    }
  }

  public count(): number {
    return this.instances.length;
  }

  private createPrototypes(): void {
    const trunkMaterial = this.material('fallback-trunk-material', new Color3(0.45, 0.29, 0.18));
    const leafMaterial = this.material('fallback-leaf-material', new Color3(0.27, 0.52, 0.31));
    const rockMaterial = this.material('fallback-rock-material', new Color3(0.48, 0.5, 0.47));
    const wallMaterial = this.material('fallback-wall-material', new Color3(0.72, 0.58, 0.42));
    const roofMaterial = this.material('fallback-roof-material', new Color3(0.52, 0.21, 0.18));

    const trunk = MeshBuilder.CreateCylinder('tree-trunk-prototype', { height: 1.25, diameter: 0.26, tessellation: 8 }, this.scene);
    trunk.position.y = 0.62;
    trunk.material = trunkMaterial;

    const crown = MeshBuilder.CreateSphere('tree-crown-prototype', { diameter: 1.25, segments: 10 }, this.scene);
    crown.position.y = 1.45;
    crown.scaling.y = 1.18;
    crown.material = leafMaterial;

    const rock = MeshBuilder.CreateSphere('rock-prototype', { diameter: 1.05, segments: 8 }, this.scene);
    rock.position.y = 0.28;
    rock.scaling.set(1.15, 0.52, 0.85);
    rock.material = rockMaterial;

    const house = MeshBuilder.CreateBox('house-body-prototype', { width: 1.4, height: 1.0, depth: 1.2 }, this.scene);
    house.position.y = 0.5;
    house.material = wallMaterial;

    const roof = MeshBuilder.CreateCylinder(
      'house-roof-prototype',
      { diameterTop: 0, diameterBottom: 1.75, height: 0.78, tessellation: 4 },
      this.scene,
    );
    roof.position.y = 1.25;
    roof.rotation.y = Math.PI * 0.25;
    roof.scaling.z = 0.78;
    roof.material = roofMaterial;

    this.registerPrototype('tree', [trunk, crown]);
    this.registerPrototype('rock', [rock]);
    this.registerPrototype('house', [house, roof]);
  }

  private registerPrototype(id: string, meshes: readonly Mesh[]): void {
    for (const mesh of meshes) {
      mesh.isVisible = false;
      mesh.isPickable = false;
    }

    this.prototypes.set(id, { meshes });
  }

  private material(name: string, color: Color3): StandardMaterial {
    const material = new StandardMaterial(name, this.scene);
    material.diffuseColor = color;
    material.specularColor = new Color3(0.06, 0.06, 0.05);
    return material;
  }
}
