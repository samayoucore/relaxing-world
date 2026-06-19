import { DefaultRenderingPipeline } from '@babylonjs/core/PostProcesses/RenderPipeline/Pipelines/defaultRenderingPipeline';
import type { Scene } from '@babylonjs/core/scene';

export class PostProcessingSystem {
  public readonly pipeline: DefaultRenderingPipeline;

  public constructor(scene: Scene) {
    this.pipeline = new DefaultRenderingPipeline('cozy-post', true, scene, scene.cameras);
    this.pipeline.samples = 1;
    this.pipeline.bloomEnabled = false;
    this.pipeline.fxaaEnabled = false;
    this.pipeline.imageProcessing.contrast = 1.02;
    this.pipeline.imageProcessing.exposure = 1;
  }
}
