import { requireCondition } from '../../foundation/errors.mjs';

export function assignments(count = 20, seed = 20260904) {
  requireCondition(Number.isInteger(count) && count >= 2 && count <= 999, 'INVALID_COUNT', 'Use 2–999 participants');
  const cohorts = Array.from({ length: count }, (_, index) => index % 2 === 0 ? 'AB' : 'BA');
  let random = seed >>> 0;
  for (let i = cohorts.length - 1; i > 0; i--) {
    random = (Math.imul(random, 1664525) + 1013904223) >>> 0;
    const j = random % (i + 1); [cohorts[i], cohorts[j]] = [cohorts[j], cohorts[i]];
  }
  return cohorts.map((cohort, index) => ({ participantId: `P${String(index + 1).padStart(3,'0')}`, cohort }));
}
export function participantURL(base, assignment, study = 'wave1') {
  const url = new URL(base); url.search = ''; url.hash = '';
  url.searchParams.set('study', study); url.searchParams.set('participant', assignment.participantId); url.searchParams.set('cohort', assignment.cohort);
  return url.href;
}
