const LOG_KEY = 'mp_concept_log';
const DEBRIEF_KEY = 'mp_concept_debrief';

const readJSON = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
  catch { return fallback; }
};

const completedTitles = () => new Set(
  readJSON(LOG_KEY, [])
    .filter(row => row.type === 'episode_complete')
    .map(row => row.title)
);

function downloadJSON(){
  const payload = {
    exported_at: new Date().toISOString(),
    play_log: readJSON(LOG_KEY, []),
    debrief: readJSON(DEBRIEF_KEY, null)
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `mystery-prince-concept-test-${Date.now()}.json`;
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
  btn.textContent = 'TEST LOG';
  btn.title = 'テストログを書き出す';
  btn.addEventListener('click', downloadJSON);
  document.body.appendChild(btn);
}

function debriefMarkup(existing = {}){
  const checked = (name, value) => existing[name] === value ? 'checked' : '';
  const scale = (name) => [1,2,3,4,5].map(v => `<label><input type="radio" name="${name}" value="${v}" ${String(existing[name])===String(v)?'checked':''}><span>${v}</span></label>`).join('');
  return `<section class="test-debrief" data-debrief>
    <p class="eyebrow">CONCEPT TEST DEBRIEF</p>
    <h2>2つの事件を遊んだあとで</h2>
    <p class="debrief-lead">これはゲーム評価ではなく、「同じ3人が別の人生を演じる」体験の検証です。直感で答えてください。</p>
    <form data-debrief-form>
      <fieldset><legend>1. 役が変わっても「同じREI / MINATO / KAI」だと感じた</legend><div class="scale">${scale('identity')}</div><small>1 = まったく感じない / 5 = 強く感じる</small></fieldset>
      <fieldset><legend>2. 別の役で再登場すること自体が楽しみになった</legend><div class="scale">${scale('recast')}</div><small>1 = ならない / 5 = とても楽しみ</small></fieldset>
      <fieldset><legend>3. キャラへの感情が、誰を疑うかに影響した</legend><div class="option-row">
        <label><input type="radio" name="emotion_reasoning" value="yes" ${checked('emotion_reasoning','yes')}> はい</label>
        <label><input type="radio" name="emotion_reasoning" value="no" ${checked('emotion_reasoning','no')}> いいえ</label>
        <label><input type="radio" name="emotion_reasoning" value="unsure" ${checked('emotion_reasoning','unsure')}> わからない</label>
      </div></fieldset>
      <fieldset><legend>4. 次の事件でもっと見たい人</legend><div class="option-row">
        ${['REI','MINATO','KAI','NONE'].map(v=>`<label><input type="radio" name="next_prince" value="${v}" ${checked('next_prince',v)}> ${v==='NONE'?'特になし':v}</label>`).join('')}
      </div></fieldset>
      <fieldset><legend>5. 「次はこの人をこんな役で見たい」があれば</legend><textarea name="next_role" rows="3" placeholder="例：KAIを弁護士役で見たい">${existing.next_role || ''}</textarea></fieldset>
      <div class="debrief-actions"><button class="action primary" type="submit">回答を保存</button><button class="action" type="button" data-export-full>ログを書き出す</button></div>
      <p class="debrief-status" data-debrief-status>${existing.saved_at ? '保存済み' : ''}</p>
    </form>
  </section>`;
}

function attachDebrief(){
  const host = document.querySelector('.episode-select');
  if(!host || host.querySelector('[data-debrief]')) return;
  const done = completedTitles();
  if(!(done.has('THE 23:30 MESSAGE') && done.has('THE SEALED EXPRESS'))) return;

  const existing = readJSON(DEBRIEF_KEY, {});
  host.insertAdjacentHTML('beforeend', debriefMarkup(existing));
  const form = host.querySelector('[data-debrief-form]');
  form.querySelector('[data-export-full]').addEventListener('click', downloadJSON);
  form.addEventListener('submit', event => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    data.saved_at = new Date().toISOString();
    localStorage.setItem(DEBRIEF_KEY, JSON.stringify(data));
    const status = form.querySelector('[data-debrief-status]');
    status.textContent = '保存しました。';
    const rows = readJSON(LOG_KEY, []);
    rows.push({ at: data.saved_at, type: 'concept_debrief_saved', ...data });
    localStorage.setItem(LOG_KEY, JSON.stringify(rows.slice(-500)));
  });
}

function refreshTestUI(){
  addExportButton();
  attachDebrief();
}

const observer = new MutationObserver(() => refreshTestUI());
observer.observe(document.querySelector('#app'), { childList: true, subtree: true });
refreshTestUI();
