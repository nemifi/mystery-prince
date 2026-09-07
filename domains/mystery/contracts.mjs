import contentSchema from './content.schema.json' with { type: 'json' };
import stateSchema from './state.schema.json' with { type: 'json' };
import commandSchema from './command.schema.json' with { type: 'json' };
import { validate } from '../../foundation/validation.mjs';
import { requireCondition } from '../../foundation/errors.mjs';
import { unique } from '../../foundation/data.mjs';

const has = (map, key, label) => requireCondition(Object.hasOwn(map, key), 'DANGLING_REFERENCE', `Unknown ${label}: ${key}`);
export function validateContent(content) {
  validate(contentSchema, content);
  const { rules, performance, roles } = content;
  unique(roles.map(role => role.id), 'role');
  const roleIds = new Set(roles.map(role => role.id));
  requireCondition(roleIds.has(rules.truth.culpritRoleId), 'DANGLING_REFERENCE', 'Culprit must identify a role');
  has(rules.nodes, rules.start, 'start node');
  for (const [id, inference] of Object.entries(rules.inferences)) {
    requireCondition(id === inference.id, 'INVALID_ID', 'Inference key and ID disagree');
    inference.requiresEvidence.forEach(eid => has(rules.evidence, eid, 'evidence'));
  }
  for (const [id, evidence] of Object.entries(rules.evidence)) {
    requireCondition(evidence.id === id, 'INVALID_ID', 'Evidence key and ID disagree');
    has(performance.evidence, id, 'evidence presentation');
  }
  requireCondition(Object.keys(performance.evidence).length === Object.keys(rules.evidence).length, 'PRESENTATION_MISMATCH', 'Evidence presentations must match declared evidence');
  for (const [id, node] of Object.entries(rules.nodes)) {
    has(performance.cues, node.cueId, 'performance cue');
    const cue = performance.cues[node.cueId];
    if (cue.roleId) requireCondition(roleIds.has(cue.roleId), 'DANGLING_REFERENCE', `Unknown speaker in ${id}`);
    node.grantEvidence.forEach(eid => has(rules.evidence, eid, 'evidence'));
    if (node.action.type === 'finish') requireCondition(node.next === null && cue.kind === 'ending', 'INVALID_GRAPH', 'Finish nodes require an ending cue and no successor');
    else { requireCondition(node.next !== null, 'INVALID_GRAPH', `Missing successor at ${id}`); has(rules.nodes, node.next, 'successor'); }
    if (['choose','hypothesize'].includes(node.action.type)) {
      requireCondition(node.action.optionIds?.length >= 2, 'INVALID_OPTIONS', `${id} needs at least two choices`);
      unique(node.action.optionIds, 'choice');
      requireCondition(cue.options?.length === node.action.optionIds.length && cue.options.every(option => node.action.optionIds.includes(option.id)), 'PRESENTATION_MISMATCH', `Choices do not bind to rules at ${id}`);
      unique(cue.options.map(option => option.id), 'display choice');
    }
    if (node.action.type === 'hypothesize') {
      has(rules.inferences, node.action.inferenceId, 'inference');
      requireCondition(node.action.optionIds.includes(rules.inferences[node.action.inferenceId].acceptedOptionId), 'INVALID_OPTIONS', 'Accepted hypothesis must be selectable');
    }
    (node.action.requiresEvidence || []).forEach(eid => has(rules.evidence, eid, 'evidence'));
    (node.action.requiresInferences || []).forEach(iid => has(rules.inferences, iid, 'inference'));
  }
  // This profile intentionally defines an ordered authored traversal. A different
  // profile owns branching/live semantics; the foundation does not know either.
  let id = rules.start;
  const visited = new Set(), evidence = new Set(), inferences = new Set();
  while (id !== null) {
    requireCondition(!visited.has(id), 'UNREACHABLE_COMPLETION', 'Authored traversal contains a cycle');
    visited.add(id);
    const node = rules.nodes[id]; node.grantEvidence.forEach(eid => evidence.add(eid));
    if (node.action.type === 'hypothesize') {
      requireCondition(rules.inferences[node.action.inferenceId].requiresEvidence.every(eid => evidence.has(eid)), 'UNFAIR_INFERENCE', `Evidence arrives after inference at ${id}`);
      inferences.add(node.action.inferenceId);
    }
    if (node.action.type === 'accuse') {
      requireCondition(node.action.requiresEvidence?.every(eid => evidence.has(eid)) && node.action.requiresInferences?.every(iid => inferences.has(iid)), 'UNFAIR_ACCUSATION', 'Accusation prerequisites cannot be reached');
    }
    id = node.next;
  }
  requireCondition(visited.size === Object.keys(rules.nodes).length, 'UNREACHABLE_NODE', 'Unused nodes must not be silently published');
  requireCondition([...visited].some(nid => rules.nodes[nid].action.type === 'finish'), 'UNREACHABLE_COMPLETION', 'No completion node');
  return content;
}

export function validateState(content, state, status) {
  validate(stateSchema, state);
  has(content.rules.nodes, state.nodeId, 'state node');
  state.evidenceIds.forEach(id => has(content.rules.evidence, id, 'state evidence'));
  state.acceptedInferences.forEach(id => has(content.rules.inferences, id, 'state inference'));
  state.visited.forEach(id => has(content.rules.nodes, id, 'visited node'));
  requireCondition(state.visited.includes(state.nodeId), 'INVALID_STATE', 'Current node must have been visited');
  requireCondition(!state.finished || content.rules.nodes[state.nodeId].action.type === 'finish', 'INVALID_STATE', 'Only the ending can be finished');
  requireCondition(!status || status === 'closed' || (status === 'completed') === state.finished, 'INVALID_STATE', 'Ending and lifecycle disagree');
  let id = content.rules.start;
  for (const visited of state.visited) {
    requireCondition(visited === id, 'INVALID_STATE', 'Visited nodes must form the authored path');
    id = content.rules.nodes[visited].next;
  }
  requireCondition(state.visited.at(-1) === state.nodeId, 'INVALID_STATE', 'Current node must end the visited path');
  const availableEvidence = [...new Set(state.visited.flatMap(nodeId => content.rules.nodes[nodeId].grantEvidence))];
  requireCondition(availableEvidence.length === state.evidenceIds.length && availableEvidence.every(id => state.evidenceIds.includes(id)), 'INVALID_STATE', 'Observed evidence must match visited cues');
}
export const validateCommand = command => validate(commandSchema, command);
export function validateAction(content, state, command) {
  validateCommand(command);
  const action = content.rules.nodes[state.nodeId].action;
  requireCondition(!state.finished && command.type === action.type, 'ACTION_UNAVAILABLE', 'This action is unavailable at the current point');
  const keys = Object.keys(command.payload);
  if (['choose','hypothesize'].includes(action.type)) requireCondition(keys.length === 1 && keys[0] === 'optionId' && action.optionIds.includes(command.payload.optionId), 'INVALID_TARGET', 'Choose a declared option');
  else if (action.type === 'accuse') {
    requireCondition(keys.length === 1 && keys[0] === 'roleId' && content.roles.some(role => role.id === command.payload.roleId), 'INVALID_TARGET', 'Choose a declared role');
    requireCondition(action.requiresEvidence.every(id => state.evidenceIds.includes(id)) && action.requiresInferences.every(id => state.acceptedInferences.includes(id)), 'REQUIREMENTS_UNMET', 'The accusation is not supported yet');
  } else requireCondition(keys.length === 0, 'INVALID_COMMAND', 'This action accepts no arguments');
  if (action.type === 'hypothesize') requireCondition(content.rules.inferences[action.inferenceId].requiresEvidence.every(id => state.evidenceIds.includes(id)), 'REQUIREMENTS_UNMET', 'Required evidence is missing');
}
