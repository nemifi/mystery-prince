import { copy } from '../../foundation/data.mjs';
import { validateContent, validateInstance, validateState, validateCommand, validateAction } from '../../domains/inquiry/contracts.mjs';

const name = (content, id) => content.roles.find(role => role.id === id).name;
function answer(content, instance, topic) {
  if (topic === 'witness') return `目撃者は「${name(content, instance.allegationRoleId)}を廊下で見た」と話した。ただし、廊下にいたことと書庫に入ったことは同じではない。`;
  if (topic === 'access') return `封筒が持ち出された時間の記録には「${instance.accessToken}の鍵」とある。鍵の貸し借りはなく、持ち主が自分で使ったことも独立した記録で確認できた。`;
  return instance.keys.map(key => `${name(content, key.roleId)}の鍵には${key.token}がある。`).join('\n');
}
export const inquiryEngine = {
  id: 'inquiry-engine', contract: 'generated-inquiry/1', requires: ['case.generate/1'],
  validateContent, validateState, validateCommand, validateAction,
  async initialize(content, context) {
    const instance = await context.invoke('case.generate/1', { seed: context.seed, roles: content.roles.map(role => ({ id: role.id })), tokens: content.tokens });
    validateInstance(content, instance);
    return { state: { schema: 'inquiry-state/1', instance, observedTopics: [], belief: null, turns: [{ speaker: 'host', text: content.opening }], outcome: 'open', feedback: '' }, status: 'active', events: [{ type: 'inquiry.opened', payload: {} }] };
  },
  dispatch(content, previous, command) {
    validateAction(content, previous, command);
    const state = copy(previous), events = [];
    state.feedback = '';
    if (command.type === 'ask') {
      const text = command.payload.text.trim();
      const topic = content.questions.find(question => question.aliases.some(alias => text.toLowerCase().includes(alias.toLowerCase())));
      state.turns.push({ speaker: 'player', text });
      const response = topic ? answer(content, state.instance, topic.id) : '今は「証言」「記録」「鍵」について調べられます。どれを確かめますか。';
      state.turns.push({ speaker: 'host', text: response });
      if (topic && !state.observedTopics.includes(topic.id)) state.observedTopics.push(topic.id);
      events.push({ type: 'inquiry.asked', payload: { topic: topic?.id || null } });
    }
    if (command.type === 'hypothesize') {
      state.belief = command.payload.roleId;
      state.feedback = state.belief ? `${name(content, state.belief)}を疑っています。まだ結論は確定していません。` : 'いったん疑いを取り消しました。';
      events.push({ type: 'belief.revised', payload: { roleId: state.belief } });
    }
    if (command.type === 'close') {
      const correct = command.payload.roleId === state.instance.culpritRoleId;
      state.outcome = correct ? 'resolved' : 'unresolved';
      state.feedback = correct ? '記録と鍵の持ち主が一致しました。あなたの結論は証拠に支えられています。' : `結論を確定しました。しかし鍵の記録が示していたのは${name(content, state.instance.culpritRoleId)}でした。このプレイはここで終わります。`;
      events.push({ type: 'inquiry.concluded', payload: { roleId: command.payload.roleId, correct } });
    }
    return { state, status: state.outcome === 'open' ? 'active' : 'completed', events };
  },
  observe(content, state) {
    const active = state.outcome === 'open';
    const actions = active ? content.questions.map(question => ({ type: 'ask', payload: { text: question.label }, label: question.label })) : [];
    if (active) {
      actions.push(...content.roles.map(role => ({ type: 'hypothesize', payload: { roleId: role.id }, label: `${role.name}を疑う` })));
      if (state.belief) actions.push({ type: 'hypothesize', payload: { roleId: null }, label: '疑いを取り消す' });
      if (['access','keys'].every(topic => state.observedTopics.includes(topic))) actions.push(...content.roles.map(role => ({ type: 'close', payload: { roleId: role.id }, label: `${role.name}だと結論する` })));
    }
    return { contract: 'inquiry-stage/1', title: content.title, premise: content.premise, roles: copy(content.roles), backgroundAsset: content.backgroundAsset, turns: copy(state.turns), belief: state.belief, outcome: state.outcome, feedback: state.feedback, actions, acceptsQuestion: active };
  }
};
