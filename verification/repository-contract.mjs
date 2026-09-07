import { canonical } from '../foundation/data.mjs';

const assert = (value, message) => { if (!value) throw new Error(message); };
const equal = (actual, expected, message) => assert(canonical(actual) === canonical(expected), message);

// This exact suite runs unchanged in Node and in a real browser's IndexedDB.
export async function repositoryContract(repository) {
  equal(await repository.load('missing'), null, 'Absent records must return null');
  const created = await repository.create('one', { scope: 'alpha', nested: { count: 1 } });
  equal(await repository.create('one', { scope: 'beta' }), null, 'Creation must be exclusive');
  created.value.nested.count = 99;
  equal((await repository.load('one')).value.nested.count, 1, 'Callers cannot mutate stored data');
  const contenders = await Promise.all([2,3].map(count => repository.commit('one', created.token, { scope: 'alpha', nested: { count } })));
  equal(contenders.filter(Boolean).length, 1, 'Only one compare-and-swap may succeed');
  equal(await repository.commit('one', created.token, { scope: 'beta' }), null, 'Stale tokens must fail');
  equal((await repository.list('alpha')).length, 1, 'Scope must include its own records');
  equal(await repository.list('beta'), [], 'Scope must exclude unrelated records');
  const effect = { invocation: { capability: 'test/1', input: {} }, provider: 'test', output: { value: 1 } };
  await repository.recordEffect('one/op/0', effect);
  equal(await repository.recordEffect('one/op/0', { ...effect, output: { value: 99 } }), effect, 'External output must be write-once');
  equal(await repository.getEffect('one/op/0'), effect, 'Recorded output must survive reads');
}
