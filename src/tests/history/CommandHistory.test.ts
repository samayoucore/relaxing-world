import { describe, expect, it } from 'vitest';
import { DEFAULT_BRUSH_SETTINGS } from '../../brushes/Brush';
import { BrushManager } from '../../brushes/BrushManager';
import { CellChangeCommand } from '../../history/CellChangeCommand';
import { CommandHistory } from '../../history/CommandHistory';
import { WorldGrid } from '../../world/WorldGrid';

describe('CommandHistory', () => {
  it('undoes and redoes a brush command', () => {
    const world = new WorldGrid({ columns: 8, rows: 8, hexSize: 1, seed: 1, minElevation: -0.3, maxElevation: 3 });
    const changes = new BrushManager().applyCellBrush(world, { q: 0, r: 0 }, { ...DEFAULT_BRUSH_SETTINGS, radius: 0 });
    const index = world.hexToIndex({ q: 0, r: 0 }) ?? 0;
    const history = new CommandHistory();

    history.execute(new CellChangeCommand(world, changes));
    expect(world.getCell(index).isLand).toBe(true);

    expect(history.undo()).toBe(true);
    expect(world.getCell(index).isLand).toBe(false);

    expect(history.redo()).toBe(true);
    expect(world.getCell(index).isLand).toBe(true);
  });
});
