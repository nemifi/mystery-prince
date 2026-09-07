import contentSchema from './content.schema.json' with { type: 'json' };
import instanceSchema from './instance.schema.json' with { type: 'json' };
import stateSchema from './state.schema.json' with { type: 'json' };
import commandSchema from './command.schema.json' with { type: 'json' };
import { validate } from '../../foundation/validation.mjs';
import { unique } from '../../foundation/data.mjs';
import { requireCondition } from '../../foundation/errors.mjs';

export function validateContent(content) {
  validate(contentSchema, content);
  unique(content.roles.map(role => role.id), 'inquiry role');
  unique(content.questions.map(question => question.id), 'question topic');
  requireCondition(content.questions.length === 3 && content.tokens.length >= content.roles.length, 'INQUIRY_INCOMPLETE', 'Inquiry requires three topics and a distinct key token for each role');
}
export function validateInstance(content, instance) {
  validate(instanceSchema, instance);
  const ids = content.roles.map(role => role.id);
  requireCondition(ids.includes(instance.culpritRoleId) && ids.includes(instance.allegationRoleId) && instance.culpritRoleId !== instance.allegationRoleId, 'INVALID_GENERATION', 'The allegation must be a distinct, declared role');
  unique(instance.keys.map(key => key.roleId), 'key holder');
  unique(instance.keys.map(key => key.token), 'key token');
  requireCondition(instance.keys.length === ids.length && instance.keys.every(key => ids.includes(key.roleId) && content.tokens.includes(key.token)), 'INVALID_GENERATION', 'Generated key ownership must cover the cast');
  requireCondition(instance.keys.find(key => key.roleId === instance.culpritRoleId)?.token === instance.accessToken, 'INVALID_GENERATION', 'Access record contradicts the generated truth');
}
export function validateState(content, state, status) {
  validate(stateSchema, state); validateInstance(content, state.instance);
  requireCondition(state.belief === null || content.roles.some(role => role.id === state.belief), 'INVALID_STATE', 'Unknown belief target');
  requireCondition(state.outcome === 'open' || ['access','keys'].every(topic => state.observedTopics.includes(topic)), 'INVALID_STATE', 'Final decisions require both records');
  requireCondition(!status || status === 'closed' || (status === 'completed') === (state.outcome !== 'open'), 'INVALID_STATE', 'Outcome and lifecycle disagree');
}
export const validateCommand = command => validate(commandSchema, command);
export function validateAction(content, state, command) {
  validateCommand(command);
  requireCondition(state.outcome === 'open', 'SESSION_FINISHED', 'The final decision is irreversible');
  const keys = Object.keys(command.payload);
  if (command.type === 'ask') requireCondition(keys.length === 1 && keys[0] === 'text' && command.payload.text.trim().length > 0 && command.payload.text.length <= 500, 'INVALID_COMMAND', 'Ask a question of at most 500 characters');
  else {
    requireCondition(keys.length === 1 && keys[0] === 'roleId', 'INVALID_COMMAND', 'Expected a role selection');
    requireCondition((command.type === 'hypothesize' && command.payload.roleId === null) || content.roles.some(role => role.id === command.payload.roleId), 'INVALID_TARGET', 'Unknown role');
  }
  if (command.type === 'close') requireCondition(['access','keys'].every(topic => state.observedTopics.includes(topic)), 'REQUIREMENTS_UNMET', 'Check the access record and key ownership before concluding');
}
