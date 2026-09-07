import { copy } from '../../foundation/data.mjs';

export class IndexedDBRepository {
  constructor(name = 'mystery-prince-platform-1') {
    this.database = new Promise((resolve, reject) => {
      const request = indexedDB.open(name, 1);
      request.onupgradeneeded = () => {
        request.result.createObjectStore('sessions');
        request.result.createObjectStore('effects');
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
      request.onblocked = () => reject(new Error('Close other tabs to update local storage'));
    });
  }
  async transaction(store, mode, operation) {
    const db = await this.database;
    return new Promise((resolve, reject) => {
      const tx = db.transaction(store, mode);
      let result;
      tx.oncomplete = () => resolve(result);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error || new Error('Storage transaction aborted'));
      operation(tx.objectStore(store), value => { result = value; });
    });
  }
  load(id) {
    return this.transaction('sessions', 'readonly', (store, done) => {
      const request = store.get(id); request.onsuccess = () => done(request.result || null);
    });
  }
  create(id, value) {
    return this.transaction('sessions', 'readwrite', (store, done) => {
      const request = store.get(id);
      request.onsuccess = () => {
        if (request.result) return done(null);
        const record = { token: 1, value: copy(value) }; store.add(record, id); done(record);
      };
    });
  }
  commit(id, token, value) {
    return this.transaction('sessions', 'readwrite', (store, done) => {
      const request = store.get(id);
      request.onsuccess = () => {
        if (request.result?.token !== token) return done(null);
        const record = { token: token + 1, value: copy(value) }; store.put(record, id); done(record);
      };
    });
  }
  list(scope) {
    return this.transaction('sessions', 'readonly', (store, done) => {
      const request = store.getAll();
      request.onsuccess = () => done(request.result.filter(row => row.value.scope === scope).map(row => row.value));
    });
  }
  getEffect(key) {
    return this.transaction('effects', 'readonly', (store, done) => {
      const request = store.get(key); request.onsuccess = () => done(request.result || null);
    });
  }
  recordEffect(key, value) {
    return this.transaction('effects', 'readwrite', (store, done) => {
      const request = store.get(key);
      request.onsuccess = () => {
        if (request.result) return done(request.result);
        store.add(copy(value), key); done(copy(value));
      };
    });
  }
  async close() { (await this.database).close(); }
}
