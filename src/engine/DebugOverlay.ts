import type { PerformanceSnapshot } from '../utils/PerformanceMonitor';

export class DebugOverlay {
  public constructor(private readonly target: HTMLElement) {}

  public update(snapshot: PerformanceSnapshot, hexLabel: string): void {
    this.target.textContent = [
      `FPS ${snapshot.fps.toFixed(0)}`,
      `Meshes ${snapshot.meshCount}`,
      `Active ${snapshot.activeMeshCount}`,
      `Objects ${snapshot.objectCount}`,
      `Dirty ${snapshot.dirtyChunks}`,
      `Terrain ${snapshot.lastTerrainRebuildMs.toFixed(1)}ms`,
      hexLabel,
    ].join(' | ');
  }
}
