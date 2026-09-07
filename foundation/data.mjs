import { requireCondition } from './errors.mjs';

// Wire values are JSON values. Undefined, cycles, non-finite numbers and class
// instances are rejected rather than silently changing during serialization.
export function canonical(value, seen = new Set()) {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return JSON.stringify(value);
  if (typeof value === 'number') {
    requireCondition(Number.isFinite(value), 'INVALID_DATA', 'Numbers must be finite');
    return JSON.stringify(value);
  }
  requireCondition(typeof value === 'object' && value !== null && !seen.has(value), 'INVALID_DATA', 'Expected acyclic JSON data');
  requireCondition(Array.isArray(value) || Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null, 'INVALID_DATA', 'Class instances are not wire data');
  if (Array.isArray(value)) requireCondition(Object.keys(value).length === value.length && Array.from({ length: value.length }, (_, i) => Object.hasOwn(value, i)).every(Boolean), 'INVALID_DATA', 'Sparse arrays and array properties are not wire data');
  seen.add(value);
  const result = Array.isArray(value)
    ? `[${value.map(item => canonical(item, seen)).join(',')}]`
    : `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${canonical(value[key], seen)}`).join(',')}}`;
  seen.delete(value);
  return result;
}

export const copy = value => JSON.parse(canonical(value));
export function immutable(value) {
  const result = copy(value);
  const freeze = item => {
    if (item && typeof item === 'object') { Object.values(item).forEach(freeze); Object.freeze(item); }
    return item;
  };
  return freeze(result);
}
export async function digestBytes(bytes) {
  const hash = await globalThis.crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(hash)].map(byte => byte.toString(16).padStart(2, '0')).join('');
}
export const digest = value => digestBytes(new TextEncoder().encode(canonical(value)));

export function unique(items, label) {
  requireCondition(new Set(items).size === items.length, 'DUPLICATE_ID', `Duplicate ${label}`);
}
