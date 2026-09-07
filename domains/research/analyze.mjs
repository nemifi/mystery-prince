import exportSchema from './export.schema.json' with { type: 'json' };
import { validate } from '../../foundation/validation.mjs';
import { unique } from '../../foundation/data.mjs';
import { requireCondition } from '../../foundation/errors.mjs';
import { validateStudy, validateAnswers } from './study.mjs';

const mean = values => values.length ? Math.round(values.reduce((a,b) => a+b, 0) / values.length * 100) / 100 : null;
const median = values => {
  if (!values.length) return null;
  const sorted = [...values].sort((a,b) => a-b), i = Math.floor(sorted.length / 2);
  return mean(sorted.length % 2 ? [sorted[i]] : [sorted[i-1], sorted[i]]);
};
const counts = values => Object.fromEntries([...new Set(values)].map(value => [value, values.filter(item => item === value).length]));
export function analyze(study, exports) {
  validateStudy(study);
  requireCondition(Array.isArray(exports), 'INVALID_EXPORT', 'Expected an array of participant exports');
  exports.forEach(payload => validate(exportSchema, payload));
  unique(exports.map(payload => payload.participantId), 'participant export');
  for (const payload of exports) {
    requireCondition(payload.studyId === study.id && payload.studyRevision === study.revision && Object.hasOwn(study.cohorts, payload.cohort), 'STUDY_REVISION_MISMATCH', 'Export and study definition do not match');
    unique(payload.sessions.map(session => session.id), 'exported session');
    for (const session of payload.sessions) {
      requireCondition(Object.values(study.publications).includes(session.publicationId), 'PUBLICATION_MISMATCH', 'Export contains an unassigned publication');
      unique(session.events.map(event => event.id), 'event');
      requireCondition(Number.isFinite(Date.parse(session.startedAt)) && Number.isFinite(Date.parse(session.updatedAt)) && Date.parse(session.updatedAt) >= Date.parse(session.startedAt), 'INVALID_EXPORT', 'Session timestamps are invalid');
      for (const event of session.events) requireCondition(Number.isFinite(Date.parse(event.at)) && Date.parse(event.at) >= Date.parse(session.startedAt) && Date.parse(event.at) <= Date.parse(session.updatedAt), 'INVALID_EXPORT', 'Event timestamp is outside its session');
    }
    if (payload.blind !== null) validateAnswers(study.blind, payload.blind);
    if (payload.revealed !== null) validateAnswers(study.revealed, payload.revealed);
    requireCondition(payload.phase !== 'done' || (payload.blind !== null && payload.revealed !== null), 'INVALID_EXPORT', 'Finished debrief is missing answers');
    requireCondition(payload.revealed === null || payload.blind !== null, 'INVALID_EXPORT', 'Revealed answers require blind answers');
    const complete = study.editions.every(edition => payload.sessions.some(session => session.publicationId === study.publications[edition] && session.status === 'completed'));
    requireCondition(payload.phase === 'blind' || complete, 'INVALID_EXPORT', 'Debrief requires every assigned case to be complete');
    requireCondition(payload.phase === 'blind' ? payload.blind === null && payload.revealed === null : payload.blind !== null, 'INVALID_EXPORT', 'Blind answers and phase disagree');
    requireCondition(payload.phase === 'done' || payload.revealed === null, 'INVALID_EXPORT', 'Revealed answers were saved before the final phase');
  }
  const participants = exports.map(original => {
    const payload = { ...original, blind: original.blind === null ? null : validateAnswers(study.blind, original.blind), revealed: original.revealed === null ? null : validateAnswers(study.revealed, original.revealed) };
    const completed = new Set(payload.sessions.filter(session => session.status === 'completed').map(session => session.publicationId));
    const events = payload.sessions.flatMap(session => session.events);
    const durations = Object.fromEntries(study.editions.map(edition => {
      const plays = payload.sessions.filter(session => session.publicationId === study.publications[edition] && session.status === 'completed');
      const valid = plays.map(session => (Date.parse(session.updatedAt) - Date.parse(session.startedAt)) / 60000).filter(value => Number.isFinite(value) && value >= 0);
      return [edition, median(valid)];
    }));
    return { participantId: payload.participantId, cohort: payload.cohort, complete: study.editions.every(id => completed.has(study.publications[id])), phase: payload.phase, blind: payload.blind, revealed: payload.revealed, durations, wrongHypotheses: events.filter(event => event.type === 'hypothesis.evaluated' && event.payload.correct === false).length, wrongAccusations: events.filter(event => event.type === 'accusation.evaluated' && event.payload.correct === false).length };
  });
  const metrics = group => Object.fromEntries(study.metrics.map(key => [key, mean(group.map(p => p.revealed?.[key]).filter(value => typeof value === 'number'))]));
  const summary = {
    participants: participants.length, completed: participants.filter(p => p.complete).length,
    cohortCounts: counts(participants.map(p => p.cohort)), metrics: metrics(participants),
    byCohort: Object.fromEntries(Object.keys(study.cohorts).map(cohort => { const group = participants.filter(p => p.cohort === cohort); return [cohort, { n: group.length, metrics: metrics(group) }]; })),
    durationMedians: Object.fromEntries(study.editions.map(id => [id, median(participants.map(p => p.durations[id]).filter(v => v !== null))])),
    wrongHypothesesMean: mean(participants.map(p => p.wrongHypotheses)), wrongAccusationsMean: mean(participants.map(p => p.wrongAccusations)),
    emotionReasoning: counts(participants.map(p => p.revealed?.emotion_reasoning || 'missing')),
    nextPrince: counts(participants.map(p => p.revealed?.next_prince || 'missing')),
    blindObservations: participants.filter(p => p.blind?.observation).map(p => ({ participantId: p.participantId, text: p.blind.observation })),
    roleRequests: participants.filter(p => p.revealed?.next_role).map(p => ({ participantId: p.participantId, text: p.revealed.next_role }))
  };
  return { schema: 'research-analysis/1', studyId: study.id, studyRevision: study.revision, summary, participants };
}
