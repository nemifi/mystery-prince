import { element as e, actionButton, topbar, castList } from './dom.mjs';
import { requireCondition } from '../../foundation/errors.mjs';

export const inquiryPresenter = {
  id: 'inquiry-presenter', contract: 'inquiry-stage/1',
  render(view, { dispatch, exit, brand }) {
    requireCondition(view.contract === this.contract, 'PRESENTATION_MISMATCH', 'Unsupported observation');
    const transcript = e('div', { className: 'transcript', 'aria-label': '会話の記録' }, view.turns.map(turn => e('p', { className: `turn ${turn.speaker}` }, e('span', { className: 'eyebrow' }, turn.speaker === 'player' ? 'あなた' : '書庫の記録'), turn.text)));
    queueMicrotask(() => { transcript.scrollTop = transcript.scrollHeight; });
    const main = e('section', { className: 'inquiry-main' }, e('p', { className: 'eyebrow' }, '対話で調べる'), e('h1', {}, view.title), e('p', { className: 'muted' }, view.premise), transcript);
    if (view.acceptsQuestion) {
      const input = e('input', { name: 'question', type: 'text', maxlength: '500', required: true, placeholder: '鍵の持ち主を教えて', 'aria-label': '質問' });
      const form = e('form', { className: 'question-form', onSubmit: event => { event.preventDefault(); dispatch({ type: 'ask', payload: { text: input.value } }); } }, input, e('button', { className: 'action primary', type: 'submit' }, '質問する'));
      main.append(form);
    }
    const sidebar = e('aside', { className: 'sidebar' }, castList(view.roles), e('p', { className: 'muted' }, view.outcome === 'open' ? '記録と鍵を調べると、最後の結論を選べます。結論は一度だけです。' : 'このプレイの結論を確定しました。'), e('div', { className: 'actions' }, view.actions.map(action => actionButton(action, dispatch))), e('p', { className: 'feedback', role: 'status' }, view.feedback));
    if (view.outcome !== 'open') sidebar.append(e('button', { className: 'action primary', 'data-finish-inquiry': true, onClick: exit }, '作品一覧に戻る'));
    return e('section', { className: 'shell', 'data-player': 'inquiry' }, topbar(brand, view.title, exit), e('div', { className: 'stage' }, main, sidebar));
  }
};
