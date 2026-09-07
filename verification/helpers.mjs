import { join } from 'node:path';
import { readJSON, root } from '../tools/workspace.mjs';
import { openHost } from '../foundation/host.mjs';
import { sealPublication } from '../foundation/packages.mjs';
import { engineRegistry, defaultCapabilities, bindImplementations } from '../products/mystery-prince/runtime.mjs';
import { MemoryRepository } from '../adapters/storage/memory.mjs';
import { pythonAuthoredEngine } from '../adapters/execution/python-authored.mjs';

export const site = join(root, 'dist/site');
export const catalog = await readJSON(join(site, 'catalog.json'));
export const lock = await readJSON(join(root, 'dist/implementation-lock.json'));
export const study = await readJSON(join(site, 'studies/wave1.json'));
export async function publication(editionId) {
  const item = catalog.publications.find(item => item.editionId === editionId);
  if (!item) throw new Error(`Missing edition: ${editionId}`);
  return readJSON(join(site, item.path));
}
export async function fixture(editionId = 'the-2330-message.stage', options = {}) {
  let pkg = options.publication || await publication(editionId);
  const repository = options.repository || new MemoryRepository();
  const registry = options.registry || engineRegistry(lock);
  if (options.python) {
    const { id, ...body } = pkg, { sources, ...engine } = lock[pythonAuthoredEngine.id];
    pkg = await sealPublication({ ...body, engine });
    registry.set(engine.id, bindImplementations([pythonAuthoredEngine], lock).get(engine.id));
  }
  const host = await openHost({ publication: pkg, repository, registry, capabilities: options.capabilities || defaultCapabilities(), clock: options.clock || (() => '2026-09-08T00:00:00.000Z'), makeId: () => 'fixture-seed' });
  return { host, pkg, repository };
}
export async function command(host, id, type, payload = {}, operationId) {
  const value = await host.snapshot(id);
  return host.dispatch(id, { id: operationId || `op-${value.revision}`, expectedRevision: value.revision, type, payload });
}
// Test-only oracle. Production presenters have neither rules nor answer access.
export function solution(content, state, { wrong = false } = {}) {
  const action = content.rules.nodes[state.nodeId].action;
  let payload = {};
  if (action.type === 'choose') payload = { optionId: action.optionIds[0] };
  if (action.type === 'hypothesize') {
    const accepted = content.rules.inferences[action.inferenceId].acceptedOptionId;
    payload = { optionId: wrong ? action.optionIds.find(id => id !== accepted) : accepted };
  }
  if (action.type === 'accuse') payload = { roleId: wrong ? content.roles.find(role => role.id !== content.rules.truth.culpritRoleId).id : content.rules.truth.culpritRoleId };
  return { type: action.type, payload };
}
export async function completeAuthored(host, id, { mistakes = false } = {}) {
  const wrongAt = new Set();
  for (let steps = 0; steps < 100; steps++) {
    const snapshot = await host.snapshot(id);
    if (snapshot.status === 'completed') return snapshot;
    const action = solution(host.publication.content, snapshot.state);
    const wrong = mistakes && ['hypothesize','accuse'].includes(action.type) && !wrongAt.has(snapshot.state.nodeId);
    wrongAt.add(snapshot.state.nodeId);
    const chosen = solution(host.publication.content, snapshot.state, { wrong });
    await command(host, id, chosen.type, chosen.payload);
  }
  throw new Error('Authored traversal exceeded its bounded limit');
}
export function answers(questions, score = 4) {
  return Object.fromEntries(questions.map(q => [q.id, q.type === 'scale' ? score : q.type === 'choice' ? q.options[0].value : `回答: ${q.id}`]));
}
