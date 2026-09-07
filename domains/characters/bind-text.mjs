import { requireCondition } from '../../foundation/errors.mjs';

// Explicit role references bind to a casting at publication time. No scanning
// for character names or post-render text rewriting is needed in a presenter.
export function bindText(value, roles) {
  if (typeof value === 'string') {
    const resolved = value.replace(/\{\{role:([a-z0-9-]+)\.(name|label)\}\}/g, (_, id, field) => {
      const role = roles.find(role => role.id === id);
      requireCondition(role, 'DANGLING_REFERENCE', `Unknown role in performance text: ${id}`);
      return role[field];
    });
    requireCondition(!resolved.includes('{{') && !resolved.includes('}}'), 'INVALID_TEXT_BINDING', 'Unresolved performance text binding');
    return resolved;
  }
  if (Array.isArray(value)) return value.map(item => bindText(item, roles));
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, bindText(item, roles)]));
  return value;
}
