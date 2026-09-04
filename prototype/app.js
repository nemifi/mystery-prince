const app = document.querySelector('#app');

const catalog = [
  { code: 'A', file: './content/episode-a.json', className: 'hotel', eyebrow: 'CASE 01', title: 'THE 23:30 MESSAGE', hook: '23:30に届いた死者からのメッセージ。死亡時刻と声の時刻、その矛盾を追う。', roles: ['REI — ホテル警備責任者','MINATO — 主治医','KAI — イリュージョニスト'] },
  { code: 'B', file: './content/episode-b.json', className: 'train', eyebrow: 'CASE 02', title: 'THE SEALED EXPRESS', hook: '無傷の封印の中で宝石が偽物に変わった。停電は、本当に犯行時刻なのか。', roles: ['REI — 美術展学芸員','MINATO — 鉄道捜査官','KAI — 主任車掌'] }
];

const LOG_KEY = 'mp_concept_log';
const ORDER_KEY = 'mp_concept_order';
const params = new URLSearchParams(location.search);
const browseMode = params.get('browse') === '1';

function readLog(){
  try { return JSON.parse(localStorage.getItem(LOG_KEY) || '[]'); }
  catch { return []; }
}

function completedTitles(){
  return new Set(readLog().filter(row => row.type === 'episode_complete').map(row => row.title));
}

function resolveTestOrder(){
  const requested = (params.get('order') || '').toUpperCase();
  if(['AB','BA'].includes(requested)){
    localStorage.setItem(ORDER_KEY, requested);
    return requested;
  }
  const stored = localStorage.getItem(ORDER_KEY);
  if(['AB','BA'].includes(stored)) return stored;
  const assigned = Math.random() < 0.5 ? 'AB' : 'BA';
  localStorage.setItem(ORDER_KEY, assigned);
  return assigned;
}

const testOrder = resolveTestOrder();

let episode = null;
let eventIndex = 0;
let evidence = [];
let feedback = '';
let sessionId = crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`;
let completeLoggedFor = null;

const log = (type, payload = {}) => {
  const row = { at: new Date().toISOString(), sessionId, testOrder, episode: episode?.id || null, type, ...payload };
  const rows = readLog();
  rows.push(row);
  localStorage.setItem(LOG_KEY, JSON.stringify(rows.slice(-1000)));
  console.info('[MP TEST]', row);
};

function ensureAssignmentLogged(){
  const rows = readLog();
  if(!rows.some(row => row.type === 'test_assignment' && row.testOrder === testOrder)){
    log('test_assignment', { assignedOrder: testOrder });
  }
}

const escapeHtml = (value='') => String(value).replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));

function orderedCatalog(){
  const byCode = Object.fromEntries(catalog.map(item => [item.code, item]));
  return [...testOrder].map(code => byCode[code]);
}

function catalogForCurrentState(){
  const ordered = orderedCatalog();
  if(browseMode) return ordered;
  const done = completedTitles();
  const next = ordered.find(item => !done.has(item.title));
  return next ? [next] : ordered;
}

function renderCatalog(){
  episode = null; eventIndex = 0; evidence = []; feedback = ''; completeLoggedFor = null;
  ensureAssignmentLogged();
  const done = completedTitles();
  const visible = catalogForCurrentState();
  const allDone = catalog.every(item => done.has(item.title));
  const intro = allDone
    ? '2つの事件は完了しました。下の質問に直感で答えてください。'
    : '短いミステリーを2つ、表示された順にプレイしてください。前の作品の設定を引き継ぐ前提はありません。';

  app.innerHTML = `<section class="episode-select">
    <header class="hero-head"><p class="eyebrow">PLAYTEST BUILD</p><h1>MYSTERY PRINCE</h1><p>${intro}</p></header>
    <div class="episode-grid">${visible.map(item=>{
      const originalIndex = catalog.findIndex(row => row.code === item.code);
      const completed = done.has(item.title);
      return `<button class="episode-card ${item.className}" data-index="${originalIndex}">
        <span class="eyebrow">${completed ? 'COMPLETED' : item.eyebrow}</span><h2>${item.title}</h2><p>${item.hook}</p>
        <div class="role-row">${item.roles.map(r=>`<span>${r}</span>`).join('')}</div>
      </button>`;
    }).join('')}</div>
    <p class="log-note">テスト用ビルドです。プレイ内容はこのブラウザ内にのみ保存されます。</p>
  </section>`;
  document.querySelectorAll('.episode-card').forEach(btn=>btn.addEventListener('click',()=>loadEpisode(catalog[Number(btn.dataset.index)].file)));
}

async function loadEpisode(file){
  app.innerHTML = document.querySelector('#loading-template').innerHTML;
  episode = await fetch(file).then(r=>{ if(!r.ok) throw new Error(`Could not load ${file}`); return r.json(); });
  eventIndex = 0; evidence = []; feedback = ''; completeLoggedFor = null;
  log('episode_start', { title: episode.title });
  enterEvent();
}

function current(){ return episode.events[eventIndex]; }
function eventById(id){ return episode.events.findIndex(e=>e.id===id); }
function go(next){ feedback=''; eventIndex = typeof next === 'string' ? eventById(next) : (Number.isInteger(next) ? next : eventIndex + 1); enterEvent(); }

function enterEvent(){
  const ev = current();
  if(!ev){ renderCatalog(); return; }
  for(const item of ev.addEvidence || []){
    if(!evidence.some(e=>e.id===item.id)){ evidence.push(item); log('evidence_added',{ evidenceId:item.id, label:item.label }); }
  }
  log('event_enter',{ eventId:ev.id, eventType:ev.type });
  renderEvent();
}

function castById(id){ return episode.cast.find(c=>c.id===id); }

function portraitMarkup(characterId){
  if(!characterId) return '';
  const c=castById(characterId); if(!c) return '';
  return `<div class="character"><div class="portrait ${c.portraitClass || ''}" aria-label="${escapeHtml(c.name)} concept portrait"></div></div><div class="role-chip">${escapeHtml(c.name)} · ${escapeHtml(c.role)}</div>`;
}

function castMarkup(){ return `<div><div class="section-title">CAST / THIS ROLE</div><div class="cast-list">${episode.cast.map(c=>`<div class="cast-card"><strong>${escapeHtml(c.name)}</strong><span>${escapeHtml(c.role)}</span></div>`).join('')}</div></div>`; }
function evidenceMarkup(){ return `<div><div class="section-title">KNOWN INFORMATION</div><div class="evidence-list">${evidence.length?evidence.map((e,i)=>`<div class="evidence-card ${i===evidence.length-1?'new':''}"><strong>${escapeHtml(e.label)}</strong><span>${escapeHtml(e.text)}</span></div>`).join(''):'<div class="evidence-card"><span>まだ決定的な情報はない。</span></div>'}</div></div>`; }
function shell(sceneClass, main, controls, progressLabel=''){
  app.innerHTML = `<section class="shell"><header class="topbar"><span class="brand">MYSTERY PRINCE</span><span class="progress">${escapeHtml(episode.title)} · ${escapeHtml(progressLabel)}</span></header><div class="stage"><section class="scene ${sceneClass}"><div class="city-grid"></div>${main}</section><aside class="sidebar">${castMarkup()}${evidenceMarkup()}<div class="actions">${controls}<div class="feedback">${escapeHtml(feedback)}</div><button class="action ghost" data-home>中断して戻る</button></div></aside></div></section>`;
  document.querySelector('[data-home]').addEventListener('click',()=>{log('exit_to_catalog',{eventId:current()?.id});renderCatalog();});
}

function renderEvent(){
  const ev=current(); const scene=ev.scene || episode.scene || 'noir';
  if(ev.type==='open') return renderOpen(ev,scene);
  if(ev.type==='narration') return renderNarration(ev,scene);
  if(ev.type==='dialogue') return renderDialogue(ev,scene);
  if(ev.type==='choice') return renderChoice(ev,scene);
  if(ev.type==='reasoning') return renderReasoning(ev,scene);
  if(ev.type==='accuse') return renderAccuse(ev,scene);
  if(ev.type==='end') return renderEnd(ev,scene);
  throw new Error(`Unknown event type: ${ev.type}`);
}

function renderOpen(ev,scene){
  const main=`<div class="narration"><p class="eyebrow">${escapeHtml(ev.eyebrow || 'NEW EXPERIENCE')}</p><h1>${escapeHtml(episode.title)}</h1><p>${escapeHtml(episode.premise)}</p></div>`;
  shell(scene,main,`<button class="action primary" data-next>${escapeHtml(ev.cta || '事件に入る')}</button>`,`${eventIndex+1}/${episode.events.length}`);
  document.querySelector('[data-next]').addEventListener('click',()=>go(ev.next));
}
function renderNarration(ev,scene){
  const main=`<div class="narration"><p class="eyebrow">${escapeHtml(ev.eyebrow || 'MYSTERY')}</p><h1>${escapeHtml(ev.title || '')}</h1><p>${escapeHtml(ev.text)}</p></div>`;
  shell(scene,main,`<button class="action primary" data-next>続ける</button>`,`${eventIndex+1}/${episode.events.length}`);
  document.querySelector('[data-next]').addEventListener('click',()=>go(ev.next));
}
function renderDialogue(ev,scene){
  const c=castById(ev.character); const main=`${portraitMarkup(ev.character)}<div class="dialogue"><div class="speaker">${escapeHtml(c?.name || ev.speaker || '')}</div><p class="line">${escapeHtml(ev.text)}</p></div>`;
  shell(scene,main,`<button class="action primary" data-next>${escapeHtml(ev.cta || '続ける')}</button>`,`${eventIndex+1}/${episode.events.length}`);
  document.querySelector('[data-next]').addEventListener('click',()=>go(ev.next));
}
function renderChoice(ev,scene){
  const main=`<div class="narration"><p class="eyebrow">YOUR MOVE</p><h1>${escapeHtml(ev.title || 'どうする？')}</h1><p>${escapeHtml(ev.text || '')}</p></div>`;
  shell(scene,main,ev.options.map((o,i)=>`<button class="action" data-option="${i}">${escapeHtml(o.label)}</button>`).join(''),`${eventIndex+1}/${episode.events.length}`);
  document.querySelectorAll('[data-option]').forEach(btn=>btn.addEventListener('click',()=>{const o=ev.options[Number(btn.dataset.option)];log('choice',{eventId:ev.id,choice:o.id||o.label});feedback=o.feedback||''; if(o.advance!==false) setTimeout(()=>go(o.next || ev.next),250); else renderEvent();}));
}
function renderReasoning(ev,scene){
  const main=`<div class="narration"><p class="eyebrow">DEDUCTION</p><h1>${escapeHtml(ev.title)}</h1><p>${escapeHtml(ev.text)}</p></div>`;
  shell(scene,main,`<div class="reasoning">${ev.options.map((o,i)=>`<button class="action" data-reason="${i}">${escapeHtml(o.label)}</button>`).join('')}</div>`,`${eventIndex+1}/${episode.events.length}`);
  document.querySelectorAll('[data-reason]').forEach(btn=>btn.addEventListener('click',()=>{const o=ev.options[Number(btn.dataset.reason)];log('reasoning_attempt',{eventId:ev.id,answer:o.id||o.label,correct:!!o.correct}); if(o.correct){ feedback=o.feedback||'その推理で合っている。'; setTimeout(()=>go(o.next || ev.next),420);}else{feedback=o.feedback||'まだ説明できない点が残っている。';renderEvent();}}));
}
function renderAccuse(ev,scene){
  const main=`<div class="narration"><p class="eyebrow">FINAL DECISION</p><h1>${escapeHtml(ev.title || '誰を指名する？')}</h1><p>${escapeHtml(ev.text)}</p></div>`;
  shell(scene,main,episode.cast.map(c=>`<button class="action" data-accuse="${c.id}">${escapeHtml(c.name)} — ${escapeHtml(c.role)}</button>`).join(''),`${eventIndex+1}/${episode.events.length}`);
  document.querySelectorAll('[data-accuse]').forEach(btn=>btn.addEventListener('click',()=>{const id=btn.dataset.accuse; const ok=id===ev.correct; log('accusation',{eventId:ev.id,target:id,correct:ok}); if(ok){go(ev.next);}else{feedback=ev.wrongFeedback || 'その指名では、核心の矛盾が解けない。';renderEvent();}}));
}
function renderEnd(ev,scene){
  const c=castById(ev.character); const main=`${portraitMarkup(ev.character)}<div class="end-card"><p class="eyebrow">CASE CLOSED</p><div class="result correct">${escapeHtml(ev.title || '真相到達')}</div><p>${escapeHtml(ev.text)}</p>${ev.quote?`<p class="quote">「${escapeHtml(ev.quote)}」</p>`:''}</div>`;
  shell(scene,main,`<button class="action primary" data-finish>次へ</button>`,`${episode.events.length}/${episode.events.length}`);
  if(completeLoggedFor !== episode.id){
    log('episode_complete',{title:episode.title});
    completeLoggedFor = episode.id;
  }
  document.querySelector('[data-finish]').addEventListener('click',renderCatalog);
}

ensureAssignmentLogged();
renderCatalog();
