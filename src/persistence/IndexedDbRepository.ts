import type { SaveFile } from './SaveSchema';
import { WorldSerializer } from './WorldSerializer';

const DB_NAME = 'relaxing-world';
const STORE_NAME = 'saves';
const DB_VERSION = 1;

export interface SaveSlot {
  id: string;
  save: SaveFile;
}

export class IndexedDbRepository {
  public async put(id: string, save: SaveFile): Promise<void> {
    const database = await this.open();

    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, 'readwrite');
      transaction.objectStore(STORE_NAME).put({ id, save });
      transaction.addEventListener('complete', () => resolve());
      transaction.addEventListener('error', () => reject(transaction.error ?? new Error('IndexedDB write failed.')));
    });

    database.close();
  }

  public async get(id: string): Promise<SaveFile | undefined> {
    const database = await this.open();
    const result = await new Promise<unknown>((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, 'readonly');
      const request = transaction.objectStore(STORE_NAME).get(id);
      request.addEventListener('success', () => resolve(request.result));
      request.addEventListener('error', () => reject(request.error ?? new Error('IndexedDB read failed.')));
    });
    database.close();

    if (typeof result !== 'object' || result === null || Array.isArray(result)) {
      return undefined;
    }

    const save = (result as Record<string, unknown>).save;
    return WorldSerializer.validate(save) ? save : undefined;
  }

  public async list(): Promise<SaveSlot[]> {
    const database = await this.open();
    const result = await new Promise<unknown[]>((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, 'readonly');
      const request = transaction.objectStore(STORE_NAME).getAll();
      request.addEventListener('success', () => resolve(request.result as unknown[]));
      request.addEventListener('error', () => reject(request.error ?? new Error('IndexedDB list failed.')));
    });
    database.close();

    return result.flatMap((entry) => {
      if (typeof entry !== 'object' || entry === null || Array.isArray(entry)) {
        return [];
      }

      const record = entry as Record<string, unknown>;
      const id = record.id;
      const save = record.save;

      return typeof id === 'string' && WorldSerializer.validate(save) ? [{ id, save }] : [];
    });
  }

  public async delete(id: string): Promise<void> {
    const database = await this.open();
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, 'readwrite');
      transaction.objectStore(STORE_NAME).delete(id);
      transaction.addEventListener('complete', () => resolve());
      transaction.addEventListener('error', () => reject(transaction.error ?? new Error('IndexedDB delete failed.')));
    });
    database.close();
  }

  private async open(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.addEventListener('upgradeneeded', () => {
        const database = request.result;

        if (!database.objectStoreNames.contains(STORE_NAME)) {
          database.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      });
      request.addEventListener('success', () => resolve(request.result));
      request.addEventListener('error', () => reject(request.error ?? new Error('IndexedDB open failed.')));
    });
  }
}
