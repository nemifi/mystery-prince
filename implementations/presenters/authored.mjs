import { element as e, actionButton, topbar, castList } from './dom.mjs';
import { requireCondition } from '../../foundation/errors.mjs';

export const authoredPresenter = {
  id: 'authored-presenter', contract: 'authored-stage/1', afterCompletion: 'exit',
  render(view, { assets, dispatch, exit, brand }) {
    requireCondition(view.contract === this.contract, 'PRESENTATION_MISMATCH', 'Unsupported observation');
    const cue = view.cue, speaker = view.roles.find(role => role.id === cue.roleId);
    const scene = e('section', { className: `scene ${speaker ? 'has-character' : ''}`, 'data-cue-kind': cue.kind }, e('img', { className: 'scene-backdrop', src: assets.resolve(view.backgroundAsset), alt: '' }));
    if (speaker) scene.append(e('div', { className: 'character' }, e('img', { className: 'portrait', src: assets.resolve(speaker.portraitAsset), alt: `${speaker.name} — ${speaker.label}`, 'data-asset': speaker.portraitAsset })), e('div', { className: 'role-chip' }, `${speaker.name} · ${speaker.label}`));
    const block = e('div', { className: speaker ? 'dialogue' : 'narration' });
    if (cue.eyebrow) block.append(e('p', { className: 'eyebrow' }, cue.eyebrow));
    if (speaker) block.append(e('div', { className: 'speaker' }, speaker.name));
    if (cue.kind === 'opening') block.append(e('h1', {}, view.title), e('p', {}, view.premise));
    else {
      if (cue.title) block.append(e('h1', { className: 'scene-title' }, cue.title));
      if (cue.text) block.append(e('p', { className: 'line' }, cue.text));
      if (cue.quote) block.append(e('p', { className: 'quote' }, `「${cue.quote}」`));
    }
    scene.append(block);
    const sidebar = e('aside', { className: 'sidebar' }, e('p', { className: 'eyebrow' }, '登場人物'), castList(view.roles), e('h2', { className: 'section-title' }, '手元の情報'), e('div', { className: 'evidence-list' }, view.evidence.length ? view.evidence.map(item => e('article', { className: 'evidence-card' }, e('strong', {}, item.label), e('span', {}, item.text))) : e('p', { className: 'muted' }, 'まだ情報はありません。')), e('div', { className: 'actions' }, view.actions.map(action => actionButton(action, dispatch))), e('p', { className: 'feedback', role: 'status' }, view.feedback));
    return e('section', { className: 'shell', 'data-player': 'authored' }, topbar(brand, `${view.title} · ${view.progress.current}/${view.progress.total}`, exit), e('div', { className: 'stage' }, scene, sidebar));
  }
};
