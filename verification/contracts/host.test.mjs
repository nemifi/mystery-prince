import test from 'node:test';
import assert from 'node:assert/strict';
import { fixture, command, completeAuthored, lock } from '../helpers.mjs';
import { MemoryRepository } from '../../adapters/storage/memory.mjs';
import { seededCaseProvider } from '../../adapters/generation/seeded-case.mjs';
import { sealPublication } from '../../foundation/packages.mjs';
import { copy, canonical } from '../../foundation/data.mjs';

test('command receipts survive replay; stale, reused and malformed commands do not mutate state', async () => {
  const { host } = await fixture();
  await host.create({ id: 'session' });
  const cmd = { id: 'advance', expectedRevision: 1, type: 'advance', payload: {} };
  const result = await host.dispatch('session', cmd);
  assert.deepEqual(await host.dispatch('session', cmd), result);
  const stable = await host.snapshot('session');
  await assert.rejects(host.dispatch('session', { ...cmd, payload: { forged: true } }), { code: 'COMMAND_ID_REUSED' });
  await assert.rejects(host.dispatch('session', { ...cmd, id: 'stale' }), { code: 'REVISION_CONFLICT' });
  await assert.rejects(command(host, 'session', 'accuse', { roleId: 'physician' }), { code: 'ACTION_UNAVAILABLE' });
  await assert.rejects(host.dispatch('session', { id: '../bad', expectedRevision: 2, type: 'advance', payload: {} }), { code: 'SCHEMA_INVALID' });
  assert.deepEqual(await host.snapshot('session'), stable);
  const completed = await completeAuthored(host, 'session', { mistakes: true });
  assert.equal(completed.events.filter(event => event.type === 'session.completed').length, 1);
  assert.deepEqual(await host.dispatch('session', cmd), result);
  await assert.rejects(command(host, 'session', 'finish'), { code: 'SESSION_FINISHED' });
  assert.equal(completed.state.acceptedInferences.length, 2);
  assert.equal(completed.events.filter(event => event.type === 'accusation.evaluated' && !event.payload.correct).length, 1);
});

test('simultaneous different commands commit once and preserve a resumable session', async () => {
  const { host } = await fixture(); await host.create({ id: 'race' });
  const results = await Promise.allSettled(['a','b'].map(id => host.dispatch('race', { id, expectedRevision: 1, type: 'advance', payload: {} })));
  assert.equal(results.filter(result => result.status === 'fulfilled').length, 1);
  assert.equal((await host.snapshot('race')).revision, 2);
  assert.equal((await host.snapshot('race')).pending, null);
});

test('provider outage retains its command key, then retries successfully', async () => {
  let fail = true; const keys = [];
  const provider = { ...seededCaseProvider, invoke: async (input, context) => {
    keys.push(context.idempotencyKey); if (fail) throw new Error('simulated outage');
    return seededCaseProvider.invoke(input, context);
  } };
  const { host } = await fixture('the-unwritten-alibi.inquiry', { capabilities: new Map([['case.generate/1', provider]]) });
  await assert.rejects(host.create({ id: 'retry', seed: 'fixed-seed' }), /simulated outage/);
  assert.equal((await host.snapshot('retry')).pending.id, 'initialize');
  fail = false; await host.retryPending('retry');
  assert.deepEqual(keys, ['retry/initialize/0', 'retry/initialize/0']);
  const snapshot = await host.snapshot('retry');
  assert.equal(snapshot.effects.length, 1); assert.equal(snapshot.revision, 1);
  await assert.rejects(host.retryPending('retry'), { code: 'NO_PENDING_OPERATION' });
});

test('crash after an external result was stored reuses that result after reopening', async () => {
  const backing = new MemoryRepository(); let crash = true, calls = 0;
  const repository = Object.fromEntries(['load','create','list','getEffect','recordEffect'].map(method => [method, backing[method].bind(backing)]));
  repository.commit = async (id, token, value) => {
    if (crash && value.state !== null) { crash = false; throw new Error('simulated process failure'); }
    return backing.commit(id, token, value);
  };
  const provider = { ...seededCaseProvider, invoke: async (...args) => { calls++; return seededCaseProvider.invoke(...args); } };
  const first = await fixture('the-unwritten-alibi.inquiry', { repository, capabilities: new Map([['case.generate/1', provider]]) });
  await assert.rejects(first.host.create({ id: 'crash' }), /simulated process failure/);
  const replacement = { id: 'replacement-provider', idempotent: true, invoke: () => { throw new Error('must use recorded output'); } };
  const reopened = await fixture('the-unwritten-alibi.inquiry', { repository: backing, capabilities: new Map([['case.generate/1', replacement]]) });
  await reopened.host.retryPending('crash');
  assert.equal(calls, 1);
  assert.equal((await reopened.host.snapshot('crash')).effects[0].provider, provider.id);
});

test('closing an in-flight session prevents a late provider result from reviving it', async () => {
  let release, entered;
  const pending = new Promise(resolve => { entered = resolve; });
  const provider = { ...seededCaseProvider, invoke: async (...args) => {
    entered(); await new Promise(resolve => { release = resolve; }); return seededCaseProvider.invoke(...args);
  } };
  const { host } = await fixture('the-unwritten-alibi.inquiry', { capabilities: new Map([['case.generate/1', provider]]) });
  const started = host.create({ id: 'closing' });
  const rejected = assert.rejects(started, { code: 'REVISION_CONFLICT' });
  await pending;
  await host.close('closing', 0); release(); await rejected;
  const snapshot = await host.snapshot('closing');
  assert.equal(snapshot.status, 'closed'); assert.equal(snapshot.state, null);
  assert.equal(snapshot.events.at(-1).type, 'session.closed');
});

test('two retries of the same in-flight initialization return one committed result', async () => {
  let release, announce;
  const entered = new Promise(resolve => { announce = resolve; });
  const gate = new Promise(resolve => { release = resolve; });
  const provider = { ...seededCaseProvider, invoke: async (...args) => { announce(); await gate; return seededCaseProvider.invoke(...args); } };
  const { host } = await fixture('the-unwritten-alibi.inquiry', { capabilities: new Map([['case.generate/1', provider]]) });
  const first = host.create({ id: 'same-operation' });
  await entered;
  const second = host.retryPending('same-operation');
  release();
  const results = await Promise.all([first, second]);
  assert.deepEqual(results[0], results[1]);
  const snapshot = await host.snapshot('same-operation');
  assert.equal(snapshot.revision, 1); assert.equal(snapshot.receipts.length, 1); assert.equal(snapshot.effects.length, 1);
  const forged = copy(snapshot); forged.effects[0].key = 'another-session/initialize/0';
  await assert.rejects((await fixture('the-unwritten-alibi.inquiry')).host.restore(forged), { code: 'INVALID_CHECKPOINT' });
});

test('checkpoints are publication-bound and corrupt operation histories cannot be imported', async () => {
  const { host } = await fixture(); await host.create({ id: 'portable' });
  await command(host, 'portable', 'advance');
  const snapshot = await host.snapshot('portable');
  const target = await fixture(); await target.host.restore(snapshot);
  assert.deepEqual(await target.host.observe('portable'), await host.observe('portable'));
  const other = await fixture('the-sealed-express.stage');
  await assert.rejects(other.host.restore(snapshot), { code: 'PUBLICATION_MISMATCH' });
  const corrupt = copy(snapshot); corrupt.revision++;
  await assert.rejects((await fixture()).host.restore(corrupt), { code: 'INVALID_CHECKPOINT' });
  const tampered = copy(snapshot); tampered.state.evidenceIds = ['missing'];
  await assert.rejects((await fixture()).host.restore(tampered), { code: 'DANGLING_REFERENCE' });
  await assert.rejects(target.host.restore(snapshot), { code: 'SESSION_EXISTS' });
});

test('implementation digests, explicit capability grants and idempotency are enforced', async () => {
  const { pkg } = await fixture('the-unwritten-alibi.inquiry');
  const { id, ...body } = pkg;
  const denied = await sealPublication({ ...body, permissions: [] });
  await assert.rejects(fixture('', { publication: denied }), { code: 'PERMISSION_DENIED' });
  await assert.rejects(fixture('', { publication: pkg, capabilities: new Map() }), { code: 'CAPABILITY_UNAVAILABLE' });
  const incorrect = await sealPublication({ ...body, engine: { ...body.engine, digest: '0'.repeat(64) } });
  await assert.rejects(fixture('', { publication: incorrect }), { code: 'IMPLEMENTATION_MISMATCH' });
  const unsafe = await fixture('', { publication: pkg, capabilities: new Map([['case.generate/1', { id: 'unsafe', invoke() {} }]]) });
  await assert.rejects(unsafe.host.create({ id: 'unsafe' }), { code: 'CAPABILITY_CONTRACT' });
  assert.ok(lock['authored-engine'].sources.includes('domains/mystery/contracts.mjs'));
});

test('wire values reject ambiguous data and canonicalize object key order', () => {
  assert.equal(canonical({ z: [1, null], a: true }), canonical({ a: true, z: [1, null] }));
  for (const value of [NaN, Infinity, undefined, new Date(), Array(2), { bad: undefined }]) assert.throws(() => canonical(value), { code: 'INVALID_DATA' });
  const cyclic = {}; cyclic.self = cyclic;
  assert.throws(() => canonical(cyclic), { code: 'INVALID_DATA' });
});
