import test from 'node:test';
import assert from 'node:assert/strict';
import { fixture, catalog, command, publication, solution, completeAuthored } from '../helpers.mjs';
import { validateContent } from '../../domains/mystery/contracts.mjs';
import { copy } from '../../foundation/data.mjs';
import { digestCaseProvider } from '../../adapters/generation/digest-case.mjs';
import { seededCaseProvider } from '../../adapters/generation/seeded-case.mjs';
import { authoredTerminal, inquiryTerminal } from '../../implementations/presenters/terminal.mjs';

for (const item of catalog.publications.filter(item => item.profile === 'authored-mystery/1')) {
  test(`${item.editionId}: complete work runs through an independent Python engine with identical public behavior`, async () => {
    const js = await fixture(item.editionId), python = await fixture(item.editionId, { python: true });
    assert.deepEqual(js.pkg.content, python.pkg.content);
    assert.notEqual(js.pkg.id, python.pkg.id);
    assert.deepEqual(await js.host.create({ id: 'equivalence' }), await python.host.create({ id: 'equivalence' }));
    const wrongAt = new Set();
    for (let count = 0; count < 100; count++) {
      const state = await js.host.snapshot('equivalence');
      const other = await python.host.snapshot('equivalence');
      assert.deepEqual(state.state, other.state);
      assert.deepEqual(state.events, other.events);
      if (state.status === 'completed') return;
      const action = solution(js.pkg.content, state.state);
      const wrong = ['hypothesize','accuse'].includes(action.type) && !wrongAt.has(state.state.nodeId);
      wrongAt.add(state.state.nodeId);
      const chosen = solution(js.pkg.content, state.state, { wrong });
      const expected = await command(js.host, 'equivalence', chosen.type, chosen.payload);
      assert.deepEqual(await command(python.host, 'equivalence', chosen.type, chosen.payload), expected);
      assert.ok(authoredTerminal.render(expected.observation).includes(item.title));
      assert.ok(!Object.hasOwn(expected.observation, 'rules'));
      assert.ok(!Object.hasOwn(expected.observation.cue, 'responses'));
    }
    assert.fail('No completion within the declared bound');
  });
}

test('authored compiler rejects unreachable, cyclic and unfair evidence graphs', async () => {
  const base = (await publication('the-2330-message.stage')).content;
  const cycle = copy(base); cycle.rules.nodes[cycle.rules.start].next = cycle.rules.start;
  assert.throws(() => validateContent(cycle), { code: 'UNREACHABLE_COMPLETION' });
  const orphan = copy(base); orphan.rules.nodes.orphan = copy(orphan.rules.nodes[orphan.rules.start]);
  assert.throws(() => validateContent(orphan), { code: 'UNREACHABLE_NODE' });
  const unfair = copy(base);
  Object.values(unfair.rules.nodes).forEach(node => { node.grantEvidence = []; });
  assert.throws(() => validateContent(unfair), { code: 'UNFAIR_INFERENCE' });
});

for (const provider of [seededCaseProvider, digestCaseProvider]) {
  test(`${provider.id}: generation changes truth by seed, supports revision of beliefs and both terminal outcomes`, async () => {
    const culprits = new Set();
    for (let i = 0; i < 12; i++) {
      const { host, pkg } = await fixture('the-unwritten-alibi.inquiry', { capabilities: new Map([['case.generate/1', provider]]) });
      const initial = await host.create({ id: `inquiry-${i}`, seed: `seed-${i}` });
      const id = initial.sessionId, instance = (await host.snapshot(id)).state.instance;
      culprits.add(instance.culpritRoleId);
      assert.ok(!Object.hasOwn(initial.observation, 'instance'));
      assert.ok(!JSON.stringify(initial.observation).includes('culpritRoleId'));
      assert.ok(inquiryTerminal.render(initial.observation).includes(pkg.work.title));
      await assert.rejects(command(host, id, 'close', { roleId: instance.culpritRoleId }), { code: 'REQUIREMENTS_UNMET' });
      await command(host, id, 'hypothesize', { roleId: instance.allegationRoleId });
      assert.equal((await command(host, id, 'hypothesize', { roleId: null })).observation.belief, null);
      await command(host, id, 'ask', { text: '証言' });
      assert.deepEqual((await host.snapshot(id)).state.observedTopics, ['witness']);
      await command(host, id, 'ask', { text: '記録' });
      await command(host, id, 'ask', { text: '鍵' });
      const result = await command(host, id, 'close', { roleId: i % 2 ? instance.allegationRoleId : instance.culpritRoleId });
      assert.equal(result.status, 'completed');
      assert.equal(result.observation.outcome, i % 2 ? 'unresolved' : 'resolved');
      assert.deepEqual(result.observation.actions, []);
      await assert.rejects(command(host, id, 'hypothesize', { roleId: null }), { code: 'SESSION_FINISHED' });
    }
    assert.equal(culprits.size, 3);
  });
}

test('invalid generated truth is rejected before a playable session is committed', async () => {
  const provider = { ...seededCaseProvider, invoke: async (...args) => ({ ...await seededCaseProvider.invoke(...args), accessToken: 'fabricated-token' }) };
  const { host } = await fixture('the-unwritten-alibi.inquiry', { capabilities: new Map([['case.generate/1', provider]]) });
  await assert.rejects(host.create({ id: 'invalid' }), { code: 'INVALID_GENERATION' });
  const snapshot = await host.snapshot('invalid');
  assert.equal(snapshot.state, null); assert.equal(snapshot.status, 'initializing');
});
