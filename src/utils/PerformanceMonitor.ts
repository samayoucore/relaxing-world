export interface PerformanceSnapshot {
  frameTimeMs: number;
  fps: number;
  meshCount: number;
  activeMeshCount: number;
  objectCount: number;
  dirtyChunks: number;
  lastTerrainRebuildMs: number;
}

export class PerformanceMonitor {
  private previousTime = performance.now();
  private smoothedFrameTimeMs = 16.67;
  private terrainRebuildMs = 0;

  public tick(now = performance.now()): void {
    const delta = Math.max(0.001, now - this.previousTime);
    this.previousTime = now;
    this.smoothedFrameTimeMs = this.smoothedFrameTimeMs * 0.9 + delta * 0.1;
  }

  public setLastTerrainRebuild(ms: number): void {
    this.terrainRebuildMs = ms;
  }

  public snapshot(meshCount: number, activeMeshCount: number, objectCount: number, dirtyChunks: number): PerformanceSnapshot {
    return {
      frameTimeMs: this.smoothedFrameTimeMs,
      fps: 1_000 / this.smoothedFrameTimeMs,
      meshCount,
      activeMeshCount,
      objectCount,
      dirtyChunks,
      lastTerrainRebuildMs: this.terrainRebuildMs,
    };
  }
}
