import type { Command } from './Command';

export class CompositeCommand implements Command {
  public constructor(
    public readonly label: string,
    private readonly commands: readonly Command[],
  ) {}

  public execute(): void {
    for (const command of this.commands) {
      command.execute();
    }
  }

  public revert(): void {
    for (const command of [...this.commands].reverse()) {
      command.revert();
    }
  }
}
