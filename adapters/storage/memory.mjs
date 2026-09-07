import { copy } from '../../foundation/data.mjs';

export class MemoryRepository {
  #sessions = new Map();
  #effects = new Map();
  async load(id) { return this.#sessions.has(id) ? copy(this.#sessions.get(id)) : null; }
  async create(id, value) {
    if (this.#sessions.has(id)) return null;
    const record = { token: 1, value: copy(value) };
    this.#sessions.set(id, record);
    return copy(record);
  }
  async commit(id, token, value) {
    if (this.#sessions.get(id)?.token !== token) return null;
    const record = { token: token + 1, value: copy(value) };
    this.#sessions.set(id, record);
    return copy(record);
  }
  async list(scope) { return [...this.#sessions.values()].filter(row => row.value.scope === scope).map(row => copy(row.value)); }
  async getEffect(key) { return this.#effects.has(key) ? copy(this.#effects.get(key)) : null; }
  async recordEffect(key, value) {
    if (!this.#effects.has(key)) this.#effects.set(key, copy(value));
    return copy(this.#effects.get(key));
  }
}
