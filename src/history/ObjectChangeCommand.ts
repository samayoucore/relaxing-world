import type { ObjectPlacementSystem } from '../objects/ObjectPlacementSystem';
import type { WorldObject } from '../objects/WorldObject';
import type { Command } from './Command';

export class ObjectChangeCommand implements Command {
  public constructor(
    private readonly objects: ObjectPlacementSystem,
    private readonly added: readonly WorldObject[],
    private readonly removed: readonly WorldObject[],
    public readonly label = 'Object edit',
  ) {}

  public execute(): void {
    for (const object of this.removed) {
      this.objects.remove(object.id);
    }

    for (const object of this.added) {
      this.objects.addExisting(object);
    }
  }

  public revert(): void {
    for (const object of this.added) {
      this.objects.remove(object.id);
    }

    for (const object of this.removed) {
      this.objects.addExisting(object);
    }
  }
}
