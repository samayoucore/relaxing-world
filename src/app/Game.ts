import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import type { Scene } from '@babylonjs/core/scene';
import { BrushManager, type CellChange } from '../brushes/BrushManager';
import { BrushPreview } from '../brushes/BrushPreview';
import { CameraController } from '../engine/CameraController';
import { DebugOverlay } from '../engine/DebugOverlay';
import { EngineFactory } from '../engine/EngineFactory';
import { EnvironmentSystem } from '../engine/EnvironmentSystem';
import { LightingSystem } from '../engine/LightingSystem';
import { PickingService } from '../engine/PickingService';
import { RenderQualityManager } from '../engine/RenderQualityManager';
import { SceneFactory } from '../engine/SceneFactory';
import { CellChangeCommand } from '../history/CellChangeCommand';
import { CommandHistory } from '../history/CommandHistory';
import { ObjectChangeCommand } from '../history/ObjectChangeCommand';
import { ObjectPlacementSystem } from '../objects/ObjectPlacementSystem';
import { ObjectRenderer } from '../objects/ObjectRenderer';
import { JsonExportService } from '../persistence/JsonExportService';
import { IndexedDbRepository } from '../persistence/IndexedDbRepository';
import { WorldDeserializer } from '../persistence/WorldDeserializer';
import { WorldSerializer } from '../persistence/WorldSerializer';
import { PostProcessingSystem } from '../rendering/PostProcessingSystem';
import { TerrainChunkManager } from '../terrain/TerrainChunkManager';
import { PerformanceMonitor } from '../utils/PerformanceMonitor';
import { hashStringToSeed } from '../utils/Random';
import { axialRound } from '../hex/HexMath';
import { worldToAxial } from '../hex/HexLayout';
import { worldLayoutFromConfig } from '../world/WorldConfig';
import { WorldGrid } from '../world/WorldGrid';
import { WorldSampler } from '../world/WorldSampler';
import type { AppUi } from '../ui/AppUi';
import { DEFAULT_GAME_CONFIG, type GameConfig } from './GameConfig';
import { createInitialGameState, type GameState } from './GameState';
import { GameLoop } from './GameLoop';

interface PendingCellChange {
  before: CellChange['before'];
  after: CellChange['after'];
}

export class Game {
  private readonly state: GameState = createInitialGameState();
  private world: WorldGrid;
  private sampler: WorldSampler;
  private readonly objects = new ObjectPlacementSystem();
  private readonly history = new CommandHistory();
  private readonly brushManager = new BrushManager();
  private readonly repository = new IndexedDbRepository();
  private readonly performance = new PerformanceMonitor();
  private readonly terrain: TerrainChunkManager;
  private readonly objectRenderer: ObjectRenderer;
  private readonly picking: PickingService;
  private readonly brushPreview: BrushPreview;
  private readonly debug: DebugOverlay;
  private readonly loop: GameLoop;
  private readonly resizeHandler: () => void;
  private activeStroke = false;
  private readonly pendingCellChanges = new Map<number, PendingCellChange>();
  private lastHexLabel = 'Hex -';

  public constructor(
    private readonly ui: AppUi,
    private readonly config: GameConfig = DEFAULT_GAME_CONFIG,
  ) {
    const canvas = ui.getCanvas();
    const engine = EngineFactory.create(canvas);
    const scene = SceneFactory.create(engine);
    const camera = new CameraController(scene, canvas);
    camera.setTarget(Vector3.Zero());
    const lighting = new LightingSystem(scene);
    EnvironmentSystem.create(scene, config.terrainWorldSize);

    if (!navigator.webdriver) {
      new PostProcessingSystem(scene);
    }
    new RenderQualityManager(engine).setQuality('medium');

    this.world = new WorldGrid(config.world);
    this.sampler = new WorldSampler(this.world);
    this.terrain = new TerrainChunkManager(scene, this.sampler, {
      worldSize: config.terrainWorldSize,
      chunksPerSide: config.terrainChunksPerSide,
      segmentsPerChunk: config.terrainSegmentsPerChunk,
    });
    this.objectRenderer = new ObjectRenderer(scene, lighting);
    this.picking = new PickingService(scene, camera.camera);
    this.brushPreview = new BrushPreview(scene, this.world.config);
    this.debug = new DebugOverlay(document.querySelector('.debug-strip') ?? document.body);
    this.loop = new GameLoop(engine, scene, () => this.beforeRender(scene));
    this.resizeHandler = () => engine.resize();
    window.addEventListener('resize', this.resizeHandler);
    this.attachInput(canvas);
  }

  public start(): void {
    this.seedInitialIsland();
    this.terrain.markAllDirty();
    this.performance.setLastTerrainRebuild(this.terrain.rebuildDirty());
    this.objectRenderer.rebuild(this.objects.list());
    this.loop.start();
    this.ui.setLoading(false);
  }

  public setBrush(settings: GameState['brush']): void {
    this.state.brush = { ...settings };
  }

  public newWorld(): void {
    this.world = new WorldGrid(this.config.world);
    this.sampler = new WorldSampler(this.world);
    this.terrain.setSampler(this.sampler);
    this.objects.clear();
    this.objectRenderer.rebuild([]);
    this.history.clear();
    this.state.worldName = 'Quiet Ocean';
    this.performance.setLastTerrainRebuild(this.terrain.rebuildDirty());
    this.ui.showToast('New world ready');
  }

  public async save(): Promise<void> {
    const save = WorldSerializer.serialize(this.world, this.objects, this.state.worldName);
    await this.repository.put('autosave', save);
    this.ui.showToast('Saved');
  }

  public async load(): Promise<void> {
    const save = await this.repository.get('autosave');

    if (!save) {
      this.ui.showToast('No save found');
      return;
    }

    this.world = WorldDeserializer.apply(save, this.objects);
    this.sampler = new WorldSampler(this.world);
    this.terrain.setSampler(this.sampler);
    this.terrain.markAllDirty();
    this.performance.setLastTerrainRebuild(this.terrain.rebuildDirty());
    this.objectRenderer.rebuild(this.objects.list());
    this.history.clear();
    this.ui.showToast('Loaded');
  }

  public exportJson(): void {
    JsonExportService.download(
      WorldSerializer.serialize(this.world, this.objects, this.state.worldName),
    );
  }

  public async importJson(file: File): Promise<void> {
    const save = JsonExportService.parse(await file.text());
    this.world = WorldDeserializer.apply(save, this.objects);
    this.sampler = new WorldSampler(this.world);
    this.terrain.setSampler(this.sampler);
    this.performance.setLastTerrainRebuild(this.terrain.rebuildDirty());
    this.objectRenderer.rebuild(this.objects.list());
    this.history.clear();
    this.ui.showToast('Imported');
  }

  public undo(): void {
    if (this.history.undo()) {
      this.terrain.markAllDirty();
      this.performance.setLastTerrainRebuild(this.terrain.rebuildDirty());
      this.objectRenderer.rebuild(this.objects.list());
    }
  }

  public redo(): void {
    if (this.history.redo()) {
      this.terrain.markAllDirty();
      this.performance.setLastTerrainRebuild(this.terrain.rebuildDirty());
      this.objectRenderer.rebuild(this.objects.list());
    }
  }

  public dispose(): void {
    this.loop.stop();
    window.removeEventListener('resize', this.resizeHandler);
  }

  private beforeRender(scene: Scene): void {
    this.performance.tick();
    const rebuildMs = this.terrain.rebuildDirty();

    if (rebuildMs > 0.01) {
      this.performance.setLastTerrainRebuild(rebuildMs);
    }

    const snapshot = this.performance.snapshot(
      scene.meshes.length,
      scene.getActiveMeshes().length,
      this.objects.count(),
      this.terrain.dirtyCount(),
    );
    this.debug.update(snapshot, this.lastHexLabel);
  }

  private attachInput(canvas: HTMLCanvasElement): void {
    canvas.addEventListener('pointerdown', (event) => {
      if (this.isUiEvent(event) || !this.isPaintGesture(event)) {
        return;
      }

      canvas.setPointerCapture(event.pointerId);
      this.activeStroke = true;
      this.pendingCellChanges.clear();
      this.paintAt(event);
    });

    canvas.addEventListener('pointermove', (event) => {
      this.updatePreview(event);

      if (this.activeStroke) {
        this.paintAt(event);
      }
    });

    canvas.addEventListener('pointerup', (event) => {
      const wasPainting = this.activeStroke;
      this.finishStroke();

      if (wasPainting && canvas.hasPointerCapture(event.pointerId)) {
        canvas.releasePointerCapture(event.pointerId);
      }
    });

    canvas.addEventListener('pointercancel', () => {
      this.finishStroke();
    });

    window.addEventListener('keydown', (event) => {
      if (event.ctrlKey && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        this.undo();
      }

      if (event.ctrlKey && event.key.toLowerCase() === 'y') {
        event.preventDefault();
        this.redo();
      }
    });
  }

  private paintAt(event: PointerEvent): void {
    const point = this.pick(event);

    if (!point) {
      return;
    }

    if (this.state.brush.tool === 'object') {
      this.applyObjectBrush(point);
      return;
    }

    const layout = worldLayoutFromConfig(this.world.config);
    const hex = axialRound(worldToAxial({ x: point.x, z: point.z }, layout));
    const changes = this.brushManager.applyCellBrush(this.world, hex, this.state.brush);

    for (const change of changes) {
      const pending = this.pendingCellChanges.get(change.index);
      this.pendingCellChanges.set(change.index, {
        before: pending?.before ?? change.before,
        after: change.after,
      });
    }

    this.terrain.markAround(
      point.x,
      point.z,
      this.state.brush.radius * this.world.config.hexSize * 3.2,
    );
  }

  private applyObjectBrush(point: Vector3): void {
    const brush = this.state.brush;
    const sampledY = this.surfaceObjectY(point.x, point.z);
    const terrainPoint = new Vector3(point.x, sampledY, point.z);

    if (brush.mode === 'remove') {
      const removed = this.objects.removeNearest(
        point.x,
        point.z,
        brush.radius * this.world.config.hexSize,
      );

      if (removed) {
        this.history.execute(new ObjectChangeCommand(this.objects, [], [removed], 'Remove object'));
        this.objectRenderer.rebuild(this.objects.list());
      }

      return;
    }

    const seed = hashStringToSeed(`${point.x.toFixed(2)}:${point.z.toFixed(2)}:${Date.now()}`);
    const added =
      brush.scatterDensity > 1
        ? this.objects.scatter(
            brush.objectDefinitionId,
            terrainPoint,
            brush.radius * 0.55,
            brush.scatterDensity,
            seed,
            (x, z) => this.surfaceObjectY(x, z),
          )
        : [
            this.objects.add({
              definitionId: brush.objectDefinitionId,
              x: point.x,
              y: sampledY,
              z: point.z,
              rotationY: 0,
              scale: 1,
            }),
          ];
    this.history.execute(new ObjectChangeCommand(this.objects, added, [], 'Place object'));
    this.objectRenderer.rebuild(this.objects.list());
  }

  private finishStroke(): void {
    if (!this.activeStroke) {
      return;
    }

    this.activeStroke = false;
    const changes: CellChange[] = Array.from(this.pendingCellChanges.entries()).map(
      ([index, change]) => ({
        index,
        before: change.before,
        after: change.after,
      }),
    );
    this.pendingCellChanges.clear();

    if (changes.length > 0) {
      this.history.execute(new CellChangeCommand(this.world, changes, 'Brush stroke'));
      this.performance.setLastTerrainRebuild(this.terrain.rebuildDirty());
    }
  }

  private surfaceObjectY(x: number, z: number): number {
    return Math.max(0.05, this.sampler.sample(x, z).height);
  }

  private updatePreview(event: PointerEvent): void {
    const point = this.pick(event);

    if (!point) {
      this.brushPreview.hide();
      return;
    }

    const layout = worldLayoutFromConfig(this.world.config);
    const hex = axialRound(worldToAxial({ x: point.x, z: point.z }, layout));
    this.lastHexLabel = `Hex ${hex.q},${hex.r}`;
    this.brushPreview.update(hex, this.state.brush.radius);
  }

  private pick(event: PointerEvent): Vector3 | undefined {
    if (this.isUiEvent(event)) {
      return undefined;
    }

    return this.picking.pickSeaPlane(event.clientX, event.clientY, this.ui.getCanvas());
  }

  private isUiEvent(event: Event): boolean {
    return event.target instanceof Element && event.target.closest('[data-ui]') !== null;
  }

  private isPaintGesture(event: PointerEvent): boolean {
    return event.button === 0 && !event.altKey && !event.ctrlKey && !event.metaKey;
  }

  private seedInitialIsland(): void {
    const centers = [
      { q: 0, r: 0 },
      { q: 2, r: -1 },
      { q: -2, r: 1 },
    ];

    for (const center of centers) {
      const changes = this.brushManager.applyCellBrush(this.world, center, {
        ...this.state.brush,
        tool: 'land',
        radius: 5,
        strength: 0.8,
      });

      if (changes.length > 0) {
        this.history.execute(new CellChangeCommand(this.world, changes, 'Initial island'));
      }
    }

    this.objects.scatter(
      'tree',
      { x: -2.5, y: this.surfaceObjectY(-2.5, 1.5), z: 1.5 },
      2.2,
      5,
      12,
      (x, z) => this.surfaceObjectY(x, z),
    );
    this.objects.scatter(
      'rock',
      { x: 3, y: this.surfaceObjectY(3, -2), z: -2 },
      1.8,
      4,
      22,
      (x, z) => this.surfaceObjectY(x, z),
    );
    this.objects.add({
      definitionId: 'house',
      x: 0.6,
      y: this.surfaceObjectY(0.6, 1.2),
      z: 1.2,
      rotationY: 0.4,
      scale: 1,
    });
    this.history.clear();
  }
}
