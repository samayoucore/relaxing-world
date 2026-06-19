import { Engine } from '@babylonjs/core/Engines/engine';

export class EngineFactory {
  public static create(canvas: HTMLCanvasElement): Engine {
    const engine = new Engine(
      canvas,
      true,
      {
        adaptToDeviceRatio: true,
        preserveDrawingBuffer: false,
        stencil: true,
        disableWebGL2Support: false,
      },
      true,
    );

    engine.setHardwareScalingLevel(Math.min(window.devicePixelRatio, 1.5));
    return engine;
  }
}
