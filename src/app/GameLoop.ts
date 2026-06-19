import type { Engine } from '@babylonjs/core/Engines/engine';
import type { Scene } from '@babylonjs/core/scene';

export class GameLoop {
  public constructor(
    private readonly engine: Engine,
    private readonly scene: Scene,
    private readonly beforeRender: () => void,
  ) {}

  public start(): void {
    this.engine.runRenderLoop(() => {
      this.beforeRender();
      this.scene.render();
    });
  }

  public stop(): void {
    this.engine.stopRenderLoop();
  }
}
