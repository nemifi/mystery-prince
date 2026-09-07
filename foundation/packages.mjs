import schema from './publication.schema.json' with { type: 'json' };
import { validate } from './validation.mjs';
import { copy, digest, immutable, unique } from './data.mjs';
import { requireCondition } from './errors.mjs';

export async function sealPublication(body) {
  const publication = { ...copy(body), id: `pub_${await digest(body)}` };
  return verifyPublication(publication);
}

export async function verifyPublication(publication) {
  validate(schema, publication);
  const { id, ...body } = publication;
  requireCondition(id === `pub_${await digest(body)}`, 'INTEGRITY_MISMATCH', 'Publication contents do not match its ID');
  unique(publication.assets.map(asset => asset.id), 'asset reference');
  return immutable(publication);
}

export function resolveImplementation(registry, descriptor) {
  const implementation = registry.get(descriptor.id);
  requireCondition(implementation, 'UNSUPPORTED_IMPLEMENTATION', `Implementation ${descriptor.id} is unavailable`);
  requireCondition(implementation.contract === descriptor.contract, 'UNSUPPORTED_CONTRACT', `Unsupported contract for ${descriptor.id}`);
  requireCondition(implementation.digest === descriptor.digest, 'IMPLEMENTATION_MISMATCH', `Publication requires a different build of ${descriptor.id}`);
  return implementation;
}
