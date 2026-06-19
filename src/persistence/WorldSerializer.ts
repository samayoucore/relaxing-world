import type { ObjectPlacementSystem } from '../objects/ObjectPlacementSystem';
import type { WorldGrid } from '../world/WorldGrid';
import { SAVE_SCHEMA_VERSION, type SaveFile } from './SaveSchema';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isNumberArray = (value: unknown): value is number[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'number' && Number.isFinite(item));

export class WorldSerializer {
  public static serialize(world: WorldGrid, objects: ObjectPlacementSystem, worldName: string): SaveFile {
    const now = new Date().toISOString();

    return {
      schemaVersion: SAVE_SCHEMA_VERSION,
      gameVersion: '0.1.0',
      createdAt: now,
      updatedAt: now,
      worldName,
      worldConfig: world.config,
      seed: world.config.seed,
      cells: world.getRawCellsForSerialization(),
      objects: objects.list(),
      rivers: [],
    };
  }

  public static validate(value: unknown): value is SaveFile {
    if (!isRecord(value)) {
      return false;
    }

    const cells = value.cells;
    const config = value.worldConfig;

    return (
      value.schemaVersion === SAVE_SCHEMA_VERSION &&
      typeof value.gameVersion === 'string' &&
      typeof value.createdAt === 'string' &&
      typeof value.updatedAt === 'string' &&
      typeof value.worldName === 'string' &&
      isRecord(config) &&
      typeof config.columns === 'number' &&
      typeof config.rows === 'number' &&
      typeof config.hexSize === 'number' &&
      typeof config.seed === 'number' &&
      typeof config.maxElevation === 'number' &&
      typeof config.minElevation === 'number' &&
      isRecord(cells) &&
      isNumberArray(cells.landFlags) &&
      isNumberArray(cells.elevations) &&
      isNumberArray(cells.biomeWeights) &&
      isNumberArray(cells.moisture) &&
      isNumberArray(cells.temperature) &&
      Array.isArray(value.objects) &&
      Array.isArray(value.rivers)
    );
  }
}
