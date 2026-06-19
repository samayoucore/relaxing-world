import type { Engine } from '@babylonjs/core/Engines/engine';

export type RenderQuality = 'low' | 'medium' | 'high';

export class RenderQualityManager {
  private quality: RenderQuality = 'medium';

  public constructor(private readonly engine: Engine) {}

  public setQuality(quality: RenderQuality): void {
    this.quality = quality;

    switch (quality) {
      case 'low':
        this.engine.setHardwareScalingLevel(1.5);
        break;
      case 'medium':
        this.engine.setHardwareScalingLevel(Math.min(window.devicePixelRatio, 1.5));
        break;
      case 'high':
        this.engine.setHardwareScalingLevel(1);
        break;
    }
  }

  public getQuality(): RenderQuality {
    return this.quality;
  }
}
