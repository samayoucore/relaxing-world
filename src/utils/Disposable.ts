export interface Disposable {
  dispose(): void;
}

export class DisposableStack implements Disposable {
  private readonly disposables: Disposable[] = [];

  public use<TDisposable extends Disposable>(disposable: TDisposable): TDisposable {
    this.disposables.push(disposable);
    return disposable;
  }

  public defer(dispose: () => void): void {
    this.disposables.push({ dispose });
  }

  public dispose(): void {
    for (const disposable of this.disposables.splice(0).reverse()) {
      disposable.dispose();
    }
  }
}
