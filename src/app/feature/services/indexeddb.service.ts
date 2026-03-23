import { Injectable } from '@angular/core';
import { Folder } from '../stores/models';

@Injectable({ providedIn: 'root' })
export class IndexedDbService {
  private readonly dbName = 'flash-card-db';
  private readonly storeName = 'app_kv';
  private readonly dbVersion = 1;
  private readonly foldersKey = 'folders';

  async getFolders(): Promise<Folder[]> {
    if (!this.isBrowser()) {
      return [];
    }

    const db = await this.openDb();
    return new Promise<Folder[]>((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readonly');
      const store = tx.objectStore(this.storeName);
      const req = store.get(this.foldersKey);

      req.onsuccess = () => {
        const result = req.result as { key: string; value: Folder[] } | undefined;
        resolve(result?.value ?? []);
      };

      req.onerror = () => reject(req.error);
    });
  }

  async saveFolders(folders: Folder[]): Promise<void> {
    if (!this.isBrowser()) {
      return;
    }

    const db = await this.openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readwrite');
      const store = tx.objectStore(this.storeName);

      store.put({ key: this.foldersKey, value: folders });

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  }

  private openDb(): Promise<IDBDatabase> {
    return new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'key' });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof indexedDB !== 'undefined';
  }
}
