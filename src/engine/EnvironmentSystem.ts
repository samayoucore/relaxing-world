import type { Scene } from '@babylonjs/core/scene';
import { SkySystem } from '../rendering/SkySystem';
import { WaterSystem } from '../rendering/WaterSystem';

export interface EnvironmentSystems {
  sky: SkySystem;
  water: WaterSystem;
}

export class EnvironmentSystem {
  public static create(scene: Scene, worldSize: number): EnvironmentSystems {
    return {
      sky: new SkySystem(scene, worldSize),
      water: new WaterSystem(scene, worldSize),
    };
  }
}
