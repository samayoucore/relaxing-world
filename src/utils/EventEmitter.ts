export type EventListener<TPayload> = (payload: TPayload) => void;

export class EventEmitter<TPayload> {
  private readonly listeners = new Set<EventListener<TPayload>>();

  public subscribe(listener: EventListener<TPayload>): () => void {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  }

  public emit(payload: TPayload): void {
    for (const listener of this.listeners) {
      listener(payload);
    }
  }

  public clear(): void {
    this.listeners.clear();
  }
}
