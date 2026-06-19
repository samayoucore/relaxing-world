import type { Command } from './Command';

export class CommandHistory {
  private readonly undoStack: Command[] = [];
  private readonly redoStack: Command[] = [];

  public constructor(private readonly limit = 80) {}

  public get canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  public get canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  public execute(command: Command): void {
    command.execute();
    this.undoStack.push(command);
    this.redoStack.length = 0;

    if (this.undoStack.length > this.limit) {
      this.undoStack.shift();
    }
  }

  public undo(): boolean {
    const command = this.undoStack.pop();

    if (!command) {
      return false;
    }

    command.revert();
    this.redoStack.push(command);
    return true;
  }

  public redo(): boolean {
    const command = this.redoStack.pop();

    if (!command) {
      return false;
    }

    command.execute();
    this.undoStack.push(command);
    return true;
  }

  public clear(): void {
    this.undoStack.length = 0;
    this.redoStack.length = 0;
  }
}
