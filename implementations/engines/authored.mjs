import { copy } from '../../foundation/data.mjs';
import { validateContent, validateState, validateCommand, validateAction } from '../../domains/mystery/contracts.mjs';

function enter(content, state, nodeId) {
  state.nodeId = nodeId;
  if (!state.visited.includes(nodeId)) state.visited.push(nodeId);
  const events = [{ type: 'stage.entered', payload: { cueId: content.rules.nodes[nodeId].cueId } }];
  for (const id of content.rules.nodes[nodeId].grantEvidence) {
    if (state.evidenceIds.includes(id)) continue;
    state.evidenceIds.push(id);
    events.push({ type: 'evidence.observed', payload: { evidenceId: id, kind: content.rules.evidence[id].kind } });
  }
  return events;
}

export const authoredEngine = {
  id: 'authored-engine', contract: 'authored-mystery/1', requires: [],
  validateContent, validateState, validateCommand, validateAction,
  initialize(content) {
    const state = { schema: 'authored-state/1', nodeId: content.rules.start, evidenceIds: [], acceptedInferences: [], beliefs: {}, choices: {}, visited: [], feedback: '', finished: false };
    return { state, status: 'active', events: enter(content, state, state.nodeId) };
  },
  dispatch(content, previous, command) {
    validateAction(content, previous, command);
    const state = copy(previous), node = content.rules.nodes[state.nodeId], cue = content.performance.cues[node.cueId];
    const events = [];
    state.feedback = '';
    let advance = true;
    if (command.type === 'choose') {
      state.choices[state.nodeId] = command.payload.optionId;
      state.feedback = cue.responses?.[command.payload.optionId] || '';
      events.push({ type: 'choice.selected', payload: { cueId: node.cueId, optionId: command.payload.optionId } });
    }
    if (command.type === 'hypothesize') {
      const inference = content.rules.inferences[node.action.inferenceId];
      const correct = inference.acceptedOptionId === command.payload.optionId;
      state.beliefs[`${inference.id}:${command.payload.optionId}`] = correct ? 'accepted' : 'refuted';
      if (correct && !state.acceptedInferences.includes(inference.id)) state.acceptedInferences.push(inference.id);
      state.feedback = cue.responses?.[command.payload.optionId] || '';
      events.push({ type: 'hypothesis.evaluated', payload: { inferenceId: inference.id, optionId: command.payload.optionId, correct } });
      advance = correct;
    }
    if (command.type === 'accuse') {
      const correct = content.rules.truth.culpritRoleId === command.payload.roleId;
      events.push({ type: 'accusation.evaluated', payload: { roleId: command.payload.roleId, correct } });
      state.feedback = correct ? '' : cue.wrongResponse;
      advance = correct;
    }
    if (command.type === 'finish') state.finished = true;
    else if (advance) events.push(...enter(content, state, node.next));
    return { state, status: state.finished ? 'completed' : 'active', events };
  },
  observe(content, state) {
    const node = content.rules.nodes[state.nodeId], { responses, wrongResponse, ...cue } = content.performance.cues[node.cueId];
    const command = node.action.type;
    const actions = state.finished ? [] : command === 'accuse'
      ? content.roles.map(role => ({ type: command, payload: { roleId: role.id }, label: `${role.name} — ${role.label}` }))
      : ['choose','hypothesize'].includes(command)
        ? cue.options.map(option => ({ type: command, payload: { optionId: option.id }, label: option.label }))
        : [{ type: command, payload: {}, label: command === 'finish' ? '事件を終える' : cue.cta || '続ける' }];
    return {
      contract: 'authored-stage/1', title: content.title, premise: content.premise,
      cue: copy(cue), roles: copy(content.roles), backgroundAsset: content.performance.backgroundAsset,
      evidence: state.evidenceIds.map(id => ({ ...copy(content.rules.evidence[id]), ...copy(content.performance.evidence[id]) })), actions,
      progress: { current: state.visited.length, total: Object.keys(content.rules.nodes).length }, feedback: state.feedback
    };
  }
};
