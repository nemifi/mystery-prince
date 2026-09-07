import { element as e } from './dom.mjs';

export function renderResearch(controller, state, { run, refresh, exportData }) {
  const { study } = controller;
  const root = e('section', { className: 'test-debrief', 'data-study-phase': state.phase });
  const heading = state.phase === 'blind' ? '最初の感想を教えてください' : state.phase === 'pause' ? '最初の回答を保存しました' : state.phase === 'done' ? 'ご協力ありがとうございました' : '企画意図を明かしたあとの質問';
  root.append(e('p', { className: 'eyebrow' }, 'PLAYTEST NOTES'), e('h2', {}, heading));
  if (state.phase === 'pause') {
    root.append(e('p', { className: 'muted' }, 'インタビュー担当者がいる場合は、ここで一度止めてください。担当者の指示後、次へ進みます。'), e('button', { className: 'action primary', 'data-reveal': true, onClick: () => run(async () => { await controller.reveal(); await refresh(); }) }, '次の質問へ'));
  } else if (state.phase === 'done') root.append(e('p', { className: 'muted' }, '回答をこのブラウザーに保存しました。テストデータを書き出して担当者へお渡しください。'));
  else {
    root.append(e('p', { className: 'debrief-lead' }, state.phase === 'blind' ? '気づいたことや感じたことを、そのまま教えてください。' : study.revealText));
    const questions = state.phase === 'blind' ? study.blind : study.revealed;
    const form = e('form', { 'data-questionnaire': state.phase });
    for (const question of questions) {
      const fieldset = e('fieldset', {}, e('legend', {}, question.label));
      if (question.type === 'text') fieldset.append(e('textarea', { name: question.id, rows: 4, maxlength: 5000, required: question.required }));
      else {
        const options = question.type === 'scale' ? [1,2,3,4,5].map(value => ({ value: String(value), label: String(value) })) : question.options;
        fieldset.append(e('div', { className: question.type === 'scale' ? 'scale' : 'option-row' }, options.map(option => e('label', {}, e('input', { type: 'radio', name: question.id, value: option.value, required: question.required }), e('span', {}, option.label)))));
        if (question.type === 'scale') fieldset.append(e('small', {}, '1 = まったく感じない / 5 = 強く感じる'));
      }
      form.append(fieldset);
    }
    form.append(e('button', { className: 'action primary', type: 'submit' }, '回答を保存'));
    form.addEventListener('submit', event => {
      event.preventDefault();
      const answers = Object.fromEntries(new FormData(form).entries());
      run(async () => { if (state.phase === 'blind') await controller.saveBlind(answers); else await controller.saveRevealed(answers); await refresh(); });
    });
    root.append(form);
  }
  root.append(e('button', { className: 'action ghost', type: 'button', 'data-export': true, onClick: () => run(exportData) }, 'テストデータを書き出す'));
  return root;
}
