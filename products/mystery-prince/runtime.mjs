import { authoredEngine } from '../../implementations/engines/authored.mjs';
import { inquiryEngine } from '../../implementations/engines/inquiry.mjs';
import { seededCaseProvider } from '../../adapters/generation/seeded-case.mjs';

export function bindImplementations(implementations, lock) {
  return new Map(implementations.map(implementation => [implementation.id, { ...implementation, digest: lock[implementation.id].digest }]));
}
export const engineRegistry = lock => bindImplementations([authoredEngine, inquiryEngine], lock);
export const defaultCapabilities = () => new Map([['case.generate/1', seededCaseProvider]]);
