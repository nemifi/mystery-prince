import { requireCondition } from '../../foundation/errors.mjs';

// Product policy is deliberately outside the host and either rule vocabulary.
export function checkBrand({ intent, cast, assets }) {
  requireCondition(intent.schema === 'work-intent/1' && intent.id && intent.title && intent.summary, 'EDITORIAL_INCOMPLETE', 'Work identity and premise are required');
  requireCondition(Array.isArray(intent.mechanicalObligations) && intent.mechanicalObligations.length > 0 && Array.isArray(intent.editorialObligations) && intent.editorialObligations.length > 0, 'EDITORIAL_INCOMPLETE', 'Mechanical and human editorial obligations must be explicit');
  requireCondition(cast.length > 0 && cast.every(role => role.characterId && role.name && assets[role.portraitAsset]), 'EDITORIAL_INCOMPLETE', 'Every casting needs a character and a visual realization');
  return { structuralPolicy: 'passed', humanReview: intent.reviewStatus, mechanicalObligations: intent.mechanicalObligations, editorialObligations: intent.editorialObligations };
}
