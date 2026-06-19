import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera';
import type { ArcRotateCameraPointersInput } from '@babylonjs/core/Cameras/Inputs/arcRotateCameraPointersInput';
import type { ArcRotateHandlers } from '@babylonjs/core/Cameras/arcRotateCameraMovement';
import type { InputMapEntry } from '@babylonjs/core/Cameras/inputMapper';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import type { Scene } from '@babylonjs/core/scene';

type ArcRotateInputMapEntry = InputMapEntry<keyof ArcRotateHandlers>;

export class CameraController {
  public readonly camera: ArcRotateCamera;

  public constructor(scene: Scene, canvas: HTMLCanvasElement) {
    this.camera = new ArcRotateCamera(
      'world-camera',
      Math.PI * 0.28,
      Math.PI * 0.38,
      34,
      new Vector3(0, 0, 0),
      scene,
    );
    this.camera.lowerBetaLimit = 0.2;
    this.camera.upperBetaLimit = 1.35;
    this.camera.lowerRadiusLimit = 12;
    this.camera.upperRadiusLimit = 135;
    this.camera.wheelDeltaPercentage = 0.01;
    this.camera.panningSensibility = 70;
    this.camera.inertia = 0.76;
    this.camera.attachControl(canvas, true);

    const pointerInput = this.camera.inputs.attached.pointers as
      | ArcRotateCameraPointersInput
      | undefined;

    if (pointerInput) {
      pointerInput.buttons = [0, 1, 2];
      this.configurePointerMap();
    }
  }

  public setTarget(target: Vector3): void {
    this.camera.setTarget(target);
  }

  private configurePointerMap(): void {
    const input = this.camera.movement.input;
    input.inputMap = input.inputMap.filter((entry): entry is ArcRotateInputMapEntry => {
      return !(entry.source === 'pointer' && entry.button === 0 && entry.interaction === 'rotate');
    });
    input.addEntry({
      source: 'pointer',
      button: 0,
      modifiers: { alt: true },
      interaction: 'rotate',
    });
    input.addEntry({ source: 'pointer', button: 1, interaction: 'rotate' });
  }
}
