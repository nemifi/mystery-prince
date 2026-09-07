import test from 'node:test';
import assert from 'node:assert/strict';
import { fixture, completeAuthored, answers, study } from '../helpers.mjs';
import { MemoryRepository } from '../../adapters/storage/memory.mjs';
import { openStudy } from '../../domains/research/study.mjs';
import { analyze } from '../../domains/research/analyze.mjs';
import { assignments, participantURL } from '../../domains/research/assignments.mjs';
import { copy } from '../../foundation/data.mjs';

async function participant(participantId, cohort, score) {
  const repository = new MemoryRepository();
  let at = 0; const clock = () => new Date(Date.UTC(2026,8,8,0,0,at++)).toISOString();
  const controller = await openStudy({ study, repository, participantId, cohort, clock });
  assert.equal((await controller.progress()).nextEdition, study.cohorts[cohort][0]);
  await assert.rejects(controller.saveBlind(answers(study.blind)), { code: 'STUDY_NOT_COMPLETE' });
  for (const [index, edition] of study.cohorts[cohort].entries()) {
    const { host } = await fixture(edition, { repository, clock });
    const id = `${participantId}-${index}`;
    await host.create({ id, scope: controller.scope });
    await completeAuthored(host, id, { mistakes: true });
    assert.equal((await controller.progress()).nextEdition, study.cohorts[cohort][index + 1] || null);
  }
  await assert.rejects(controller.reveal(), { code: 'STUDY_PHASE_CONFLICT' });
  const blind = { ...answers(study.blind), observation: '<script>window.injected=true</script>' };
  await controller.saveBlind(blind);
  assert.equal((await controller.state()).phase, 'pause');
  const resumed = await openStudy({ study, repository, participantId, cohort, clock });
  assert.equal((await resumed.state()).phase, 'pause');
  assert.deepEqual((await resumed.state()).blind, blind);
  await assert.rejects(resumed.saveBlind(answers(study.blind)), { code: 'STUDY_PHASE_CONFLICT' });
  await resumed.reveal(); await resumed.saveRevealed(answers(study.revealed, score));
  assert.equal((await resumed.state()).phase, 'done');
  await assert.rejects(openStudy({ study, repository, participantId, cohort: cohort === 'AB' ? 'BA' : 'AB' }), { code: 'ASSIGNMENT_CONFLICT' });
  const payload = await resumed.export();
  assert.equal(payload.sessions.length, 2);
  assert.ok(payload.sessions.every(session => !Object.hasOwn(session, 'state')));
  return { payload, controller: resumed, repository };
}

test('AB and BA are ordered, isolated and debriefed through durable one-way phases', async () => {
  const first = await participant('P001', 'AB', 5);
  const second = await participant('P002', 'BA', 3);
  const report = analyze(study, [first.payload, second.payload]);
  assert.equal(report.summary.completed, 2);
  assert.equal(report.summary.metrics.identity_rei, 4);
  assert.equal(report.summary.byCohort.AB.metrics.identity_rei, 5);
  assert.equal(report.summary.byCohort.BA.metrics.identity_rei, 3);
  assert.equal(report.summary.wrongHypothesesMean, 4);
  assert.equal(report.summary.wrongAccusationsMean, 2);
  assert.deepEqual(report.summary.cohortCounts, { AB: 1, BA: 1 });
  assert.equal(report.summary.blindObservations[0].text, '<script>window.injected=true</script>');
  const isolated = await openStudy({ study, repository: first.repository, participantId: 'P003', cohort: 'BA' });
  assert.equal((await isolated.progress()).sessions.length, 0);
  assert.equal((await isolated.state()).phase, 'blind');
});

test('analysis rejects mixed revisions, duplicate participants, invalid answers and timestamps', async () => {
  const { payload } = await participant('P010', 'AB', 4);
  payload.revealed.identity_rei = '4';
  assert.equal(analyze(study, [payload]).summary.metrics.identity_rei, 4);
  assert.throws(() => analyze(study, [payload, payload]), { code: 'DUPLICATE_ID' });
  for (const mutate of [
    data => { data.studyRevision = 'other-build'; },
    data => { data.revealed.identity_rei = 0; },
    data => { data.sessions[0].updatedAt = 'not a timestamp'; },
    data => { data.sessions = []; },
    data => { data.blind = null; },
    data => { data.sessions[0].events.push(data.sessions[0].events[0]); }
  ]) {
    const bad = copy(payload); mutate(bad);
    assert.throws(() => analyze(study, [bad]), error => typeof error.code === 'string');
  }
  assert.throws(() => analyze(study, [null]), { code: 'SCHEMA_INVALID' });
  assert.equal(analyze(study, []).summary.metrics.identity_rei, null);
});

test('completion is session state, independent of optional analytics events', async () => {
  const { payload } = await participant('P020', 'BA', 4);
  payload.sessions.forEach(session => { session.events = []; });
  assert.equal(analyze(study, [payload]).summary.completed, 1);
});

test('assignment URLs preserve the project subpath and have only the new parameters', () => {
  const rows = assignments(20, 20260904);
  assert.deepEqual(rows, assignments(20, 20260904));
  assert.equal(rows.filter(row => row.cohort === 'AB').length, 10);
  assert.equal(rows.filter(row => row.cohort === 'BA').length, 10);
  const url = new URL(participantURL('https://example.test/project/?legacy=1#old', rows[0]));
  assert.equal(url.pathname, '/project/');
  assert.deepEqual([...url.searchParams.keys()], ['study','participant','cohort']);
  assert.equal(url.hash, '');
  assert.throws(() => assignments(1), { code: 'INVALID_COUNT' });
});
