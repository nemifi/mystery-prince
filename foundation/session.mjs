import schema from './session.schema.json' with { type: 'json' };
import { validate } from './validation.mjs';
import { canonical, unique } from './data.mjs';
import { requireCondition } from './errors.mjs';

const envelopeSchema = { ...schema.$defs.command, $id: 'urn:mp:command-envelope:1' };
export const validateEnvelope = command => validate(envelopeSchema, command);

// These invariants concern operation history only; domain state stays opaque.
export function validateSession(value) {
  validate(schema, value);
  const check = (condition, message) => requireCondition(condition, 'INVALID_CHECKPOINT', message);
  unique(value.receipts.map(receipt => receipt.command.id), 'operation receipt');
  unique(value.events.map(event => event.id), 'session event');
  unique(value.effects.map(effect => effect.key), 'recorded effect');
  check(Number.isFinite(Date.parse(value.startedAt)) && Number.isFinite(Date.parse(value.updatedAt)) && value.updatedAt >= value.startedAt, 'Invalid checkpoint timestamps');
  check(value.revision === value.receipts.length + (value.status === 'closed' ? 1 : 0), 'Revision and receipts disagree');
  check(value.status === 'closed' || (value.state === null) === (value.status === 'initializing'), 'Lifecycle and checkpoint disagree');
  check(value.status === 'initializing' || value.status === 'closed' || value.receipts.at(-1)?.result.status === value.status, 'Last operation and lifecycle disagree');
  if (value.pending) {
    check(['initializing', 'active'].includes(value.status) && value.pending.expectedRevision === value.revision, 'Pending operation is inconsistent');
    check(!value.receipts.some(receipt => receipt.command.id === value.pending.id), 'Pending operation was already committed');
  }
  value.receipts.forEach(({ command, result }, index) => {
    check(command.expectedRevision === index && result.revision === index + 1 && result.sessionId === value.id, 'Receipt sequence is invalid');
    check(index === 0 ? command.type === '$initialize' : command.type !== '$initialize', 'Invalid initialization sequence');
    check(result.status !== 'completed' || index === value.receipts.length - 1, 'An operation follows completion');
  });
  const receiptEvents = value.receipts.flatMap(receipt => receipt.result.events);
  const closeEvent = value.status === 'closed' ? value.events.at(-1) : null;
  check(value.status !== 'closed' || (closeEvent?.type === 'session.closed' && closeEvent.revision === value.revision), 'Missing close event');
  check(canonical(value.events) === canonical([...receiptEvents, ...(closeEvent ? [closeEvent] : [])]), 'Events and receipts disagree');
  for (const event of value.events) check(event.revision <= value.revision && event.at >= value.startedAt && event.at <= value.updatedAt && event.id.startsWith(`${value.id}:${event.revision}:`), 'Event does not belong to this checkpoint');
  for (const effect of value.effects) {
    check(value.receipts.some(({ command }) => effect.key.startsWith(`${value.id}/${command.id}/`) && /^\d+$/.test(effect.key.slice(`${value.id}/${command.id}/`.length))), 'Effect does not belong to a completed operation');
  }
  return value;
}
