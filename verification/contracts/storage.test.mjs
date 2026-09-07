import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { MemoryRepository } from '../../adapters/storage/memory.mjs';
import { SQLiteRepository } from '../../adapters/storage/sqlite.mjs';
import { fixture, command, completeAuthored } from '../helpers.mjs';

import { repositoryContract } from '../repository-contract.mjs';

test('memory repository satisfies atomic creation, CAS, scope and effect contracts', () => repositoryContract(new MemoryRepository()));
test('SQLite repository satisfies the same contract and survives a new connection', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'mp-sqlite-'));
  let repository = new SQLiteRepository(directory);
  try {
    await repositoryContract(repository); repository.close();
    repository = new SQLiteRepository(directory);
    assert.equal((await repository.list('alpha')).length, 1);
    assert.equal((await repository.getEffect('one/op/0')).output.value, 1);
  } finally { repository.close(); await rm(directory, { recursive: true, force: true }); }
});
test('an active memory checkpoint continues identically in SQLite after restart', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'mp-transfer-'));
  let repository = new SQLiteRepository(directory);
  try {
    const source = await fixture(); await source.host.create({ id: 'transfer' });
    for (let i = 0; i < 3; i++) await command(source.host, 'transfer', 'advance');
    const destination = await fixture(undefined, { repository });
    await destination.host.restore(await source.host.snapshot('transfer'));
    repository.close(); repository = new SQLiteRepository(directory);
    const reopened = await fixture(undefined, { repository });
    assert.deepEqual(await completeAuthored(source.host, 'transfer', { mistakes: true }), await completeAuthored(reopened.host, 'transfer', { mistakes: true }));
  } finally { repository.close(); await rm(directory, { recursive: true, force: true }); }
});
test('generated instances and external receipts transfer without rerunning the generator', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'mp-effects-'));
  const repository = new SQLiteRepository(directory);
  try {
    const source = await fixture('the-unwritten-alibi.inquiry'); await source.host.create({ id: 'generated', seed: 'portable' });
    const snapshot = await source.host.snapshot('generated');
    const destination = await fixture('the-unwritten-alibi.inquiry', { repository, capabilities: new Map([['case.generate/1', { id: 'unused', idempotent: true, invoke() { throw new Error('Unexpected generation'); } }]]) });
    await destination.host.restore(snapshot);
    assert.deepEqual(await destination.host.snapshot('generated'), snapshot);
    assert.deepEqual((await command(destination.host, 'generated', 'ask', { text: '鍵' })).observation, (await command(source.host, 'generated', 'ask', { text: '鍵' })).observation);
  } finally { repository.close(); await rm(directory, { recursive: true, force: true }); }
});
