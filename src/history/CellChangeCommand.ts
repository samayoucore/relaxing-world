import type { CellChange } from '../brushes/BrushManager';
import type { WorldGrid } from '../world/WorldGrid';
import type { Command } from './Command';

export class CellChangeCommand implements Command {
  public readonly label: string;

  public constructor(
    private readonly world: WorldGrid,
    private readonly changes: readonly CellChange[],
    label = 'Cell edit',
  ) {
    this.label = label;
  }

  public execute(): void {
    for (const change of this.changes) {
      this.world.setCell(change.index, change.after);
    }
  }

  public revert(): void {
    for (const change of this.changes) {
      this.world.setCell(change.index, change.before);
    }
  }
}
