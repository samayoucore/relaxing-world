import { Color4 } from '@babylonjs/core/Maths/math.color';
import { Scene } from '@babylonjs/core/scene';
import type { Engine } from '@babylonjs/core/Engines/engine';

export class SceneFactory {
  public static create(engine: Engine): Scene {
    const scene = new Scene(engine);
    scene.clearColor = new Color4(0.67, 0.78, 0.82, 1);
    scene.fogMode = Scene.FOGMODE_EXP2;
    scene.fogColor.set(0.66, 0.77, 0.81);
    scene.fogDensity = 0.006;
    scene.useRightHandedSystem = false;
    return scene;
  }
}
