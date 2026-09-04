const LOG_KEY = 'mp_concept_log';
const ORDER_KEY = 'mp_concept_order';
const DEBRIEF_KEY = 'mp_concept_debrief';
const context = window.MP_TEST_CONTEXT || { participantId: 'LOCAL' };

const readJSON = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
  catch { return fallback; }
};

const completedTitles = () => new Set(
  readJSON(LOG_KEY, [])
    .filter(row => row.type === 'episode_complete')
    .map(row => row.title)
);

function appendLog(type, payload = {}){
  const rows = readJSON(LOG_KEY, []);
  rows.push({
    at: new Date().toISOString(),
    type,
    participant_id: context.participantId,
    testOrder: localStorage.getItem(ORDER_KEY) || null,
    ...payload
  });
  localStorage.setItem(LOG_KEY, JSON.stringify(rows.slice(-1000)));
}

function downloadJSON(){
  const order = localStorage.getItem(ORDER_KEY) || 'UNKNOWN';
  const payload = {
    participant_id: context.participantId,
    assigned_order: order,
    exported_at: new Date().toISOString(),
    play_log: readJSON(LOG_KEY, []),
    debrief: readJSON(DEBRIEF_KEY, null)
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `mystery-prince-wave1-${context.participantId}-${order}-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function addExportButton(){
  if(document.querySelector('[data-test-export]')) return;
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.dataset.testExport = '1';
  btn.className = 'test-export';
  btn.textContent = context.participantId;
  btn.title = '参加者ID / テストデータを書き出す';
  btn.addEventListener('click', downloadJSON);
  document.body.appendChild(btn);
}

const checked = (obj, name, value) => obj?.[name] === value ? 'checked' : '';
const scale = (obj, name) => [1,2,3,4,5].map(v => `<label><input type="radio" name="${name}" value="${v}" ${String(obj?.[name])===String(v)?'checked':''}><span>${v}</span></label>`).join('');

function blindFormMarkup(existing = {}){
  return `<section class="test-debrief" data-debrief>
    <p class="eyebrow">PLAYTEST NOTES</p>
    <h2>2つの事件を遊んだあとで</h2>
    <p class="debrief-lead">まだ企画意図の説明はありません。気づいたことを、そのまま書いてください。</p>
    <form data-blind-form>
      <fieldset><legend>1. 2つの事件の登場人物について、気づいたこと・印象に残ったこと</legend><textarea name="observation" rows="5" placeholder="自由に記入">${existing.observation || ''}</textarea></fieldset>
      <fieldset><legend>2. どちらの事件を、ミステリーとしてより面白いと感じた？</legend><div class="option-row">
        <label><input type="radio" name="favorite_case" value="A" ${checked(existing,'favorite_case','A')}> THE 23:30 MESSAGE</label>
        <label><input type="radio" name="favorite_case" value="B" ${checked(existing,'favorite_case','B')}> THE SEALED EXPRESS</label>
        <label><input type="radio" name="favorite_case" value="equal" ${checked(existing,'favorite_case','equal')}> 同程度</label>
      </div></fieldset>
      <fieldset><legend>3. 次の事件でもっと見たい人物</legend><div class="option-row">
        ${['REI','MINATO','KAI','NONE'].map(v=>`<label><input type="radio" name="next_prince_blind" value="${v}" ${checked(existing,'next_prince_blind',v)}> ${v==='NONE'?'特になし':v}</label>`).join('')}
      </div></fieldset>
      <div class="debrief-actions"><button class="action primary" type="submit">ブラインド回答を保存</button></div>
    </form>
  </section>`;
}

function blindPauseMarkup(state){
  return `<section class="test-debrief" data-debrief>
    <p class="eyebrow">BLIND RESPONSE SAVED</p>
    <h2>最初の回答を保存しました</h2>
    <p class="debrief-lead">インタビュー担当者がいる場合は、ここで一度止めてください。担当者の指示後、次の質問へ進みます。</p>
    <div class="debrief-actions"><button class="action primary" type="button" data-reveal>次の質問へ</button><button class="action" type="button" data-export-full>ここまでのデータを書き出す</button></div>
    <p class="debrief-status">Participant: ${context.participantId}</p>
  </section>`;
}

function revealedFormMarkup(existing = {}){
  return `<section class="test-debrief" data-debrief>
    <p class="eyebrow">CONCEPT TEST DEBRIEF</p>
    <h2>企画意図を明かしたあとの質問</h2>
    <p class="debrief-lead">この企画では、REI / MINATO / KAIという同じ3人を、作品ごとに別の人生・役として登場させる設計です。</p>
    <form data-revealed-form>
      <fieldset><legend>1. REIは、役が変わっても同じ人物だと感じた</legend><div class="scale">${scale(existing,'identity_rei')}</div><small>1 = まったく感じない / 5 = 強く感じる</small></fieldset>
      <fieldset><legend>2. MINATOは、役が変わっても同じ人物だと感じた</legend><div class="scale">${scale(existing,'identity_minato')}</div></fieldset>
      <fieldset><legend>3. KAIは、役が変わっても同じ人物だと感じた</legend><div class="scale">${scale(existing,'identity_kai')}</div></fieldset>
      <fieldset><legend>4. この「同じ人物を別役で再登場させる」こと自体が楽しみ</legend><div class="scale">${scale(existing,'recast')}</div><small>1 = ならない / 5 = とても楽しみ</small></fieldset>
      <fieldset><legend>5. キャラクターへの感情が、誰を疑うか・信じるかに影響した</legend><div class="option-row">
        <label><input type="radio" name="emotion_reasoning" value="yes" ${checked(existing,'emotion_reasoning','yes')}> はい</label>
        <label><input type="radio" name="emotion_reasoning" value="no" ${checked(existing,'emotion_reasoning','no')}> いいえ</label>
        <label><input type="radio" name="emotion_reasoning" value="unsure" ${checked(existing,'emotion_reasoning','unsure')}> わからない</label>
      </div></fieldset>
      <fieldset><legend>6. キャラクターがいることで、ミステリー自体が面白くなった</legend><div class="scale">${scale(existing,'character_mystery_synergy')}</div></fieldset>
      <fieldset><legend>7. THE 23:30 MESSAGEをミステリーとして評価</legend><div class="scale">${scale(existing,'mystery_a')}</div></fieldset>
      <fieldset><legend>8. THE SEALED EXPRESSをミステリーとして評価</legend><div class="scale">${scale(existing,'mystery_b')}</div></fieldset>
      <fieldset><legend>9. 次の事件でもっと見たい人</legend><div class="option-row">
        ${['REI','MINATO','KAI','NONE'].map(v=>`<label><input type="radio" name="next_prince" value="${v}" ${checked(existing,'next_prince',v)}> ${v==='NONE'?'特になし':v}</label>`).join('')}
      </div></fieldset>
      <fieldset><legend>10. 「次はこの人をこんな役で見たい」があれば</legend><textarea name="next_role" rows="3" placeholder="例：KAIを弁護士役で見たい">${existing.next_role || ''}</textarea></fieldset>
      <div class="debrief-actions"><button class="action primary" type="submit">回答を保存</button><button class="action" type="button" data-export-full>全データを書き出す</button></div>
      <p class="debrief-status" data-debrief-status>${existing.saved_at ? '保存済み' : ''}</p>
    </form>
  </section>`;
}

function attachDebrief(){
  const host = document.querySelector('.episode-select');
  if(!host || host.querySelector('[data-debrief]')) return;
  const done = completedTitles();
  if(!(done.has('THE 23:30 MESSAGE') && done.has('THE SEALED EXPRESS'))) return;

  const state = readJSON(DEBRIEF_KEY, {});
  if(!state.blind_saved_at){
    host.insertAdjacentHTML('beforeend', blindFormMarkup(state.blind || {}));
    const form = host.querySelector('[data-blind-form]');
    form.addEventListener('submit', event => {
      event.preventDefault();
      const blind = Object.fromEntries(new FormData(form).entries());
      const at = new Date().toISOString();
      localStorage.setItem(DEBRIEF_KEY, JSON.stringify({ ...state, blind, blind_saved_at: at, reveal_started: false }));
      appendLog('blind_debrief_saved', blind);
      host.querySelector('[data-debrief]').remove();
      attachDebrief();
    });
    return;
  }

  if(!state.reveal_started){
    host.insertAdjacentHTML('beforeend', blindPauseMarkup(state));
    host.querySelector('[data-export-full]').addEventListener('click', downloadJSON);
    host.querySelector('[data-reveal]').addEventListener('click', () => {
      const next = { ...state, reveal_started: true, reveal_started_at: new Date().toISOString() };
      localStorage.setItem(DEBRIEF_KEY, JSON.stringify(next));
      appendLog('concept_reveal_started');
      host.querySelector('[data-debrief]').remove();
      attachDebrief();
    });
    return;
  }

  host.insertAdjacentHTML('beforeend', revealedFormMarkup(state.revealed || {}));
  const form = host.querySelector('[data-revealed-form]');
  form.querySelector('[data-export-full]').addEventListener('click', downloadJSON);
  form.addEventListener('submit', event => {
    event.preventDefault();
    const revealed = Object.fromEntries(new FormData(form).entries());
    const at = new Date().toISOString();
    revealed.saved_at = at;
    localStorage.setItem(DEBRIEF_KEY, JSON.stringify({ ...state, revealed, saved_at: at }));
    appendLog('concept_debrief_saved', revealed);
    form.querySelector('[data-debrief-status]').textContent = '保存しました。右のボタンからデータを書き出してください。';
  });
}

function refreshTestUI(){
  addExportButton();
  attachDebrief();
}

const observer = new MutationObserver(() => refreshTestUI());
observer.observe(document.querySelector('#app'), { childList: true, subtree: true });
refreshTestUI();
