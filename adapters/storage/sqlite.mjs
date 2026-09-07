import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { canonical } from '../../foundation/data.mjs';

export class SQLiteRepository {
  constructor(directory) {
    mkdirSync(resolve(directory), { recursive: true });
    this.db = new DatabaseSync(join(resolve(directory), 'sessions.sqlite'));
    this.db.exec(`PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;
      CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, token INTEGER NOT NULL, scope TEXT NOT NULL, value TEXT NOT NULL) STRICT;
      CREATE TABLE IF NOT EXISTS effects (id TEXT PRIMARY KEY, value TEXT NOT NULL) STRICT;`);
  }
  record(row) { return row ? { token: row.token, value: JSON.parse(row.value) } : null; }
  async load(id) { return this.record(this.db.prepare('SELECT token,value FROM sessions WHERE id=?').get(id)); }
  async create(id, value) {
    return this.record(this.db.prepare('INSERT INTO sessions VALUES (?,1,?,?) ON CONFLICT DO NOTHING RETURNING token,value').get(id, value.scope, canonical(value)));
  }
  async commit(id, token, value) {
    return this.record(this.db.prepare('UPDATE sessions SET token=token+1,scope=?,value=? WHERE id=? AND token=? RETURNING token,value').get(value.scope, canonical(value), id, token));
  }
  async list(scope) { return this.db.prepare('SELECT value FROM sessions WHERE scope=? ORDER BY id').all(scope).map(row => JSON.parse(row.value)); }
  async getEffect(key) { const row = this.db.prepare('SELECT value FROM effects WHERE id=?').get(key); return row ? JSON.parse(row.value) : null; }
  async recordEffect(key, value) {
    this.db.prepare('INSERT INTO effects VALUES (?,?) ON CONFLICT DO NOTHING').run(key, canonical(value));
    return this.getEffect(key);
  }
  close() { this.db.close(); }
}
