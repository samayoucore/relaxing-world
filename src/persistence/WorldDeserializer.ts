import type { ObjectPlacementSystem } from '../objects/ObjectPlacementSystem';
import type { WorldObject } from '../objects/WorldObject';
import { WorldGrid } from '../world/WorldGrid';
import { migrateSave } from './SaveMigration';
import type { SaveFile } from './SaveSchema';
import { WorldSerializer } from './WorldSerializer';

const isWorldObject = (value: unknown): value is WorldObject => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }

  const record = value as Record<string, unknown>;

  return (
    typeof record.id === 'string' &&
    typeof record.definitionId === 'string' &&
    typeof record.x === 'number' &&
    typeof record.y === 'number' &&
    typeof record.z === 'number' &&
    typeof record.rotationY === 'number' &&
    typeof record.scale === 'number'
  );
};

export class WorldDeserializer {
  public static parseJson(json: string): SaveFile {
    const parsed = JSON.parse(json) as unknown;

    if (!WorldSerializer.validate(parsed)) {
      throw new Error('Imported JSON is not a valid Relaxing World save.');
    }

    return migrateSave(parsed);
  }

  public static apply(save: SaveFile, objects: ObjectPlacementSystem): WorldGrid {
    const world = new WorldGrid(save.worldConfig);
    world.loadRawCells(save.cells);
    objects.clear();

    for (const object of save.objects) {
      if (isWorldObject(object)) {
        objects.addExisting(object);
      }
    }

    return world;
  }
}
