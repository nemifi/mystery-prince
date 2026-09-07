import { openHost } from '../../foundation/host.mjs';
import { resolveImplementation } from '../../foundation/packages.mjs';
import { requireCondition } from '../../foundation/errors.mjs';
import { IndexedDBRepository } from '../../adapters/storage/indexeddb.mjs';
import { HttpSource, VerifiedAssets } from '../../adapters/distribution/http.mjs';
import { engineRegistry, bindImplementations, defaultCapabilities } from '../../products/mystery-prince/runtime.mjs';
import { authoredPresenter } from '../../implementations/presenters/authored.mjs';
import { inquiryPresenter } from '../../implementations/presenters/inquiry.mjs';
import { renderResearch } from '../../implementations/presenters/research.mjs';
import { element as e } from '../../implementations/presenters/dom.mjs';
import { openStudy } from '../../domains/research/study.mjs';

const app = document.querySelector('#app'), status = document.querySelector('#status');
const source = new HttpSource(new URL('./', location.href));
const assetCache = new VerifiedAssets(source);
const repository = new IndexedDBRepository();
const registry = engineRegistry(__MODULE_LOCK__);
const presenters = bindImplementations([authoredPresenter, inquiryPresenter], __MODULE_LOCK__);
const params = new URLSearchParams(location.search);
let catalog, research = null, current = null, busy = false;
const scope = () => research?.scope || 'play/local';

function errorMessage(error) {
  status.hidden = false;
  status.replaceChildren(document.createTextNode(`${error.message}${error.code ? ` (${error.code})` : ''}`));
}
async function run(operation) {
  if (busy) return;
  busy = true; app.setAttribute('aria-busy', 'true'); status.hidden = true;
  for (const control of app.querySelectorAll('button')) control.disabled = true;
  try { await operation(); } catch (error) { errorMessage(error); }
  finally {
    busy = false; app.setAttribute('aria-busy', 'false');
    for (const control of app.querySelectorAll('button')) control.disabled = false;
  }
}
function download(value, filename) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' }));
  const link = e('a', { href: url, download: filename }); document.body.append(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
async function exportResearch() { download(await research.export(), `mystery-prince-${research.study.id}-${research.participantId}-${research.cohort}.json`); }
function updateURL(editionId, sessionId) {
  const url = new URL(location.href);
  if (editionId) url.searchParams.set('edition', editionId); else url.searchParams.delete('edition');
  if (sessionId) url.searchParams.set('session', sessionId); else url.searchParams.delete('session');
  history.replaceState(null, '', url);
}
async function makeHost(publication) { return openHost({ publication, registry, repository, capabilities: defaultCapabilities() }); }

async function home() {
  current = null; updateURL(null);
  const plays = (await repository.list(scope())).filter(play => play.schema === 'session/1');
  const progress = research ? await research.progress() : null;
  const visible = research ? (progress.nextEdition ? [progress.nextEdition] : []) : catalog.discoveryEditions;
  const panel = e('section', { className: 'episode-select' }, e('header', { className: 'hero-head' }, e('p', { className: 'eyebrow' }, research ? 'PLAYTEST' : 'MYSTERY COLLECTION'), e('h1', {}, catalog.product.title), e('p', {}, research ? research.study.intro : catalog.product.intro)));
  const grid = e('div', { className: 'episode-grid' });
  for (const id of visible) {
    const item = catalog.publications.find(entry => entry.editionId === id);
    const related = plays.filter(play => play.publicationId === item.publicationId);
    const active = related.some(play => ['active','initializing'].includes(play.status));
    const done = related.some(play => play.status === 'completed');
    const card = e('button', { type: 'button', className: 'episode-card', 'data-edition': id, onClick: () => run(() => play(id)) }, e('img', { className: 'card-backdrop', src: source.url(item.cover), alt: '' }), e('span', { className: 'eyebrow' }, active ? 'つづきから' : done ? 'もう一度遊ぶ' : '事件に入る'), e('h2', {}, item.title), e('p', {}, item.summary), e('div', { className: 'role-row' }, item.roles.map(role => e('span', {}, `${role.name} — ${role.label}`))));
    grid.append(card);
  }
  panel.append(grid);
  if (research && progress.complete) panel.append(renderResearch(research, await research.state(), { run, refresh: home, exportData: exportResearch }));
  if (research) panel.append(e('button', { className: 'test-export', type: 'button', 'data-participant-export': true, onClick: () => run(exportResearch) }, research.participantId));
  else {
    const input = e('input', { type: 'file', accept: 'application/json,.json', 'aria-label': 'セーブファイルを読み込む' });
    input.addEventListener('change', () => run(async () => {
      const file = input.files[0]; if (!file) return;
      const snapshot = JSON.parse(await file.text());
      const item = catalog.publications.find(entry => entry.publicationId === snapshot.publicationId);
      requireCondition(item && snapshot.scope === scope(), 'PUBLICATION_MISMATCH', 'この一覧で利用できるセーブではありません。');
      const host = await makeHost(await source.publication(item.path));
      await host.restore(snapshot);
      await play(item.editionId);
    }));
    panel.append(e('details', { className: 'save-tools' }, e('summary', {}, 'セーブファイルから再開'), input));
  }
  panel.append(e('p', { className: 'log-note' }, '進行と回答はこのブラウザー内に保存されます。'));
  app.replaceChildren(panel);
}

async function renderPlay() {
  const view = await current.host.observe(current.sessionId);
  const ui = current.presenter.render(view.observation, { assets: current.assets, brand: catalog.product.title, exit: () => run(home), dispatch: action => run(async () => {
    const result = await current.host.dispatch(current.sessionId, { id: crypto.randomUUID(), expectedRevision: view.revision, type: action.type, payload: action.payload });
    if (result.status === 'completed' && current.presenter.afterCompletion === 'exit') await home(); else await renderPlay();
  }) });
  const controls = e('div', { className: 'save-bar' }, e('button', { className: 'back-link', type: 'button', onClick: () => run(async () => download(await current.host.snapshot(current.sessionId), `mystery-prince-save-${current.sessionId}.json`)) }, 'セーブを書き出す'));
  app.replaceChildren(ui, controls);
}
async function play(editionId, resumeId = null) {
  if (research) requireCondition((await research.progress()).nextEdition === editionId, 'STUDY_ORDER', '割り当てられた順番でプレイしてください。');
  const item = catalog.publications.find(entry => entry.editionId === editionId);
  requireCondition(item && (research || catalog.discoveryEditions.includes(editionId)), 'EDITION_UNAVAILABLE', 'この作品は選択できません。');
  const publication = await source.publication(item.path);
  requireCondition(publication.id === item.publicationId, 'INTEGRITY_MISMATCH', '作品一覧と公開版が一致しません。');
  const selected = publication.presenters.find(descriptor => presenters.has(descriptor.id));
  requireCondition(selected, 'PRESENTATION_UNAVAILABLE', 'この環境では作品を表示できません。');
  const host = await makeHost(publication);
  const assets = await assetCache.forPublication(publication);
  const plays = (await repository.list(scope())).filter(play => play.schema === 'session/1' && play.publicationId === publication.id).sort((a,b) => b.updatedAt.localeCompare(a.updatedAt));
  const selectedSession = resumeId ? plays.find(play => play.id === resumeId && play.status !== 'closed') : plays.find(play => ['active','initializing'].includes(play.status));
  requireCondition(!resumeId || selectedSession, 'SESSION_NOT_FOUND', 'この画面で再開できるセーブがありません。');
  let sessionId = selectedSession?.id;
  if (!sessionId) { sessionId = crypto.randomUUID(); await host.create({ id: sessionId, scope: scope() }); }
  else if (selectedSession.pending || selectedSession.status === 'initializing') await host.retryPending(sessionId);
  current = { host, publication, assets, sessionId, presenter: resolveImplementation(presenters, selected) };
  updateURL(editionId, sessionId); await renderPlay();
}

await run(async () => {
  catalog = await source.json('catalog.json');
  if (params.has('study')) {
    const reference = catalog.studies.find(item => item.id === params.get('study'));
    requireCondition(reference, 'STUDY_UNAVAILABLE', '指定されたテストは利用できません。');
    const study = await source.json(reference.path);
    requireCondition(study.implementationDigest === __MODULE_LOCK__['study-runtime'].digest, 'STUDY_IMPLEMENTATION_MISMATCH', '研究定義と画面の版が一致しません。ページを再読み込みしてください。');
    research = await openStudy({ study, repository, participantId: params.get('participant') || '', cohort: params.get('cohort') || '' });
  }
  const requested = params.get('edition');
  if (requested && (!research || (await research.progress()).nextEdition === requested)) await play(requested, params.get('session')); else await home();
});
window.addEventListener('pagehide', () => assetCache.dispose(), { once: true });
