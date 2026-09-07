import schema from './study.schema.json' with { type: 'json' };
import exportSchema from './export.schema.json' with { type: 'json' };
import { validate } from '../../foundation/validation.mjs';
import { requireCondition } from '../../foundation/errors.mjs';
import { copy, unique, digest } from '../../foundation/data.mjs';

export function validateStudy(study) {
  validate(schema, study);
  unique([...study.blind, ...study.revealed].map(question => question.id), 'question');
  unique(study.editions, 'study edition');
  unique(Object.values(study.publications), 'study publication');
  unique(study.metrics, 'study metric');
  requireCondition(study.metrics.every(id => study.revealed.some(question => question.id === id && question.type === 'scale')), 'INVALID_STUDY', 'Metrics must reference declared scale questions');
  for (const question of [...study.blind, ...study.revealed]) {
    if (question.type === 'choice') {
      requireCondition(question.options?.length >= 2, 'INVALID_STUDY', 'Choice questions need at least two options');
      unique(question.options.map(option => option.value), 'answer option');
    }
  }
  for (const order of Object.values(study.cohorts)) {
    unique(order, 'cohort edition');
    requireCondition(order.length === study.editions.length && order.every(id => study.editions.includes(id)), 'INVALID_STUDY', 'Each cohort must contain every edition exactly once');
  }
  requireCondition(study.editions.every(id => typeof study.publications[id] === 'string'), 'INVALID_STUDY', 'Every edition needs a pinned publication');
}
export function validateAnswers(questions, answers) {
  requireCondition(answers && typeof answers === 'object' && !Array.isArray(answers), 'INVALID_ANSWERS', 'Expected question answers');
  requireCondition(Object.keys(answers).every(key => questions.some(question => question.id === key)), 'INVALID_ANSWERS', 'Unknown question');
  const normalized = {};
  for (const question of questions) {
    const value = answers[question.id];
    if (value === undefined || value === '') {
      requireCondition(!question.required, 'ANSWER_REQUIRED', `回答してください: ${question.label}`);
      normalized[question.id] = ''; continue;
    }
    if (question.type === 'scale') {
      requireCondition(/^[1-5]$/.test(String(value)), 'INVALID_ANSWERS', 'Scale values must be 1–5');
      normalized[question.id] = Number(value);
    } else if (question.type === 'choice') {
      requireCondition(question.options?.some(option => option.value === value), 'INVALID_ANSWERS', 'Choose a declared answer');
      normalized[question.id] = value;
    } else {
      requireCondition(typeof value === 'string' && value.length <= 5000, 'INVALID_ANSWERS', 'Text answers must be at most 5000 characters');
      normalized[question.id] = value;
    }
  }
  return normalized;
}

export async function openStudy({ study, repository, participantId, cohort, clock = () => new Date().toISOString() }) {
  validateStudy(study);
  const { revision, ...definition } = study;
  requireCondition(revision === await digest(definition), 'STUDY_REVISION_MISMATCH', 'Study definition differs from its revision');
  requireCondition(/^[A-Z0-9_-]{1,32}$/.test(participantId), 'INVALID_PARTICIPANT', 'Participant ID must use 1–32 letters, digits, underscores or hyphens');
  requireCondition(Object.hasOwn(study.cohorts, cohort), 'INVALID_COHORT', 'Unknown assigned order');
  const scope = `study/${study.id}/${participantId}`, key = `research:${scope}`;
  await repository.create(key, { schema: 'research-state/1', scope, studyRevision: study.revision, cohort, phase: 'blind', blind: null, revealed: null, timeline: [] });
  async function read() {
    const row = await repository.load(key);
    requireCondition(row.value.studyRevision === study.revision, 'STUDY_REVISION_MISMATCH', 'This participant belongs to a different study build');
    requireCondition(row.value.cohort === cohort, 'ASSIGNMENT_CONFLICT', 'The saved assignment differs from this URL');
    return row;
  }
  await read();
  async function sessions() { return (await repository.list(scope)).filter(item => item.schema === 'session/1' && Object.values(study.publications).includes(item.publicationId)); }
  async function progress() {
    const plays = await sessions();
    const completed = new Set(plays.filter(play => play.status === 'completed').map(play => play.publicationId));
    return { sessions: plays, nextEdition: study.cohorts[cohort].find(edition => !completed.has(study.publications[edition])) || null, complete: study.editions.every(edition => completed.has(study.publications[edition])) };
  }
  async function update(expectedPhase, phase, answersKey, answers) {
    requireCondition((await progress()).complete, 'STUDY_NOT_COMPLETE', 'Finish both cases before the debrief');
    const row = await read();
    requireCondition(row.value.phase === expectedPhase, 'STUDY_PHASE_CONFLICT', 'The debrief has already advanced');
    const next = { ...row.value, phase, timeline: [...row.value.timeline, { phase, at: clock() }] };
    if (answersKey) next[answersKey] = answers;
    requireCondition(await repository.commit(key, row.token, next), 'REVISION_CONFLICT', 'Another tab changed the debrief');
    return copy(next);
  }
  return {
    scope, study, participantId, cohort, progress,
    async state() { return copy((await read()).value); },
    saveBlind: answers => update('blind', 'pause', 'blind', validateAnswers(study.blind, answers)),
    reveal: () => update('pause', 'revealed'),
    saveRevealed: answers => update('revealed', 'done', 'revealed', validateAnswers(study.revealed, answers)),
    async export() {
      const { value } = await read();
      const payload = {
        schema: 'research-export/1', studyId: study.id, studyRevision: study.revision, participantId, cohort, exportedAt: clock(),
        phase: value.phase, blind: value.blind, revealed: value.revealed,
        sessions: (await sessions()).map(({ id, publicationId, status, startedAt, updatedAt, events }) => ({ id, publicationId, status, startedAt, updatedAt, events }))
      };
      validate(exportSchema, payload); return payload;
    }
  };
}
