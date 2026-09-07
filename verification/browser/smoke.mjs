import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { build } from 'esbuild';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { root, readJSON } from '../../tools/workspace.mjs';
import { catalog, publication, study, answers, solution } from '../helpers.mjs';
import { analyze } from '../../domains/research/analyze.mjs';

const output = join(root, 'build/qa'); await mkdir(output, { recursive: true });
const base = process.env.MP_BASE_URL || 'http://127.0.0.1:8123/';
let server, browser;
const errors = [], completed = [];
async function settle(page) {
  await page.waitForFunction(() => document.querySelector('#app')?.getAttribute('aria-busy') === 'false');
  assert.equal(await page.locator('#status').isVisible(), false, await page.locator('#status').textContent());
}
async function navigate(page, suffix = '') { await page.goto(`${base}${suffix}`); await settle(page); }
async function layout(page) {
  await page.waitForFunction(() => [...document.images].every(image => image.complete));
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'Page has horizontal overflow');
  const broken = await page.locator('img').evaluateAll(images => images.filter(image => image.naturalWidth === 0).map(image => ({ src: image.src, alt: image.alt })));
  assert.deepEqual(broken, [], 'An image failed to render');
}
async function act(page, action) {
  const target = action.payload.optionId || action.payload.roleId || '';
  await page.locator(`[data-command="${action.type}"][data-target="${target}"]`).first().click();
  await settle(page);
}
async function save(page, filename) {
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'セーブを書き出す', exact: true }).click();
  const file = await download; await file.saveAs(join(output, filename));
  await settle(page); return readJSON(join(output, filename));
}
async function playAuthored(page, editionId, { reload = false, image = false, start = null } = {}) {
  const pkg = await publication(editionId);
  if (!start) { await page.locator(`[data-edition="${editionId}"]`).click(); await settle(page); }
  let nodeId = start || pkg.content.rules.start, index = 0, didReload = false, captured = false;
  while (nodeId !== null) {
    assert.ok(index++ < 100, 'No bounded completion');
    const node = pkg.content.rules.nodes[nodeId], cue = pkg.content.performance.cues[node.cueId];
    assert.equal(await page.locator('[data-player="authored"]').count(), 1);
    assert.equal(await page.locator('[data-cue-kind]').getAttribute('data-cue-kind'), cue.kind);
    if (image && cue.roleId && !captured) {
      await page.locator('.portrait').waitFor();
      await page.waitForFunction(() => document.querySelector('.portrait')?.naturalWidth > 0);
      await layout(page);
      assert.equal(await page.locator('.portrait').getAttribute('data-asset'), pkg.content.roles.find(role => role.id === cue.roleId).portraitAsset);
      await page.screenshot({ path: join(output, `${editionId}-${page.viewportSize().width}.png`), fullPage: true });
      captured = true;
    }
    if (reload && index === 4 && !didReload) {
      const before = await save(page, `checkpoint-${editionId}.json`);
      await page.reload(); await settle(page);
      const after = await save(page, `resumed-${editionId}.json`);
      assert.deepEqual(after, before); didReload = true;
    }
    if (['hypothesize','accuse'].includes(node.action.type)) {
      await act(page, solution(pkg.content, { nodeId }, { wrong: true }));
      assert.ok((await page.locator('.feedback').textContent()).length > 0);
      assert.equal(await page.locator('[data-cue-kind]').getAttribute('data-cue-kind'), cue.kind);
    }
    await act(page, solution(pkg.content, { nodeId })); nodeId = node.next;
  }
  assert.equal(await page.locator('[data-player]').count(), 0);
  return pkg;
}
async function form(page, phase, questions, score) {
  const values = answers(questions, score);
  for (const question of questions) {
    if (question.type === 'text') await page.locator(`textarea[name="${question.id}"]`).fill('<img src=x onerror="window.injected=true">感想');
    else await page.locator(`input[name="${question.id}"][value="${values[question.id]}"]`).check();
  }
  await page.locator(`[data-questionnaire="${phase}"] button[type="submit"]`).click(); await settle(page);
}

try {
  if (!process.env.MP_BASE_URL) {
    server = spawn(process.execPath, ['tools/serve.mjs'], { cwd: root, env: { ...process.env, MP_PORT: '8123' }, stdio: ['ignore','pipe','pipe'] });
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Preview server did not start within 10 seconds')), 10000);
      server.once('error', reject); server.once('exit', code => { clearTimeout(timer); reject(new Error(`Preview server exited: ${code}`)); });
      server.stdout.on('data', data => { if (String(data).includes('Preview:')) { clearTimeout(timer); resolve(); } });
      server.stderr.on('data', data => errors.push(String(data)));
    });
  }
  browser = await chromium.launch({ headless: true });
  for (const [cohort, width, score] of [['AB',1280,5],['BA',390,3]]) {
    const context = await browser.newContext({ viewport: { width, height: width < 500 ? 844 : 900 }, acceptDownloads: true });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    await page.addInitScript(() => { window.originalNative = { fetch: window.fetch, storage: Storage.prototype.setItem }; });
    const participant = `QA_${cohort}`;
    await navigate(page, `?study=wave1&participant=${participant}&cohort=${cohort}`);
    for (const editionId of study.cohorts[cohort]) {
      assert.equal(await page.locator('[data-edition]').count(), 1);
      assert.ok(!(await page.locator('body').textContent()).includes(study.revealText));
      await playAuthored(page, editionId, { reload: true, image: true });
    }
    assert.equal(await page.locator('[data-study-phase]').getAttribute('data-study-phase'), 'blind');
    assert.ok(!(await page.locator('body').textContent()).includes(study.revealText));
    await form(page, 'blind', study.blind, score);
    assert.equal(await page.locator('[data-study-phase]').getAttribute('data-study-phase'), 'pause');
    await page.reload(); await settle(page);
    assert.equal(await page.locator('[data-study-phase]').getAttribute('data-study-phase'), 'pause');
    assert.ok(!(await page.locator('body').textContent()).includes(study.revealText));
    await page.locator('[data-reveal]').click(); await settle(page);
    assert.ok((await page.locator('body').textContent()).includes(study.revealText));
    await layout(page);
    await page.screenshot({ path: join(output, `debrief-${cohort}.png`), fullPage: true });
    await form(page, 'revealed', study.revealed, score);
    const downloading = page.waitForEvent('download'); await page.locator('[data-export]').click();
    const download = await downloading; await download.saveAs(join(output, `research-${cohort}.json`));
    completed.push(await readJSON(join(output, `research-${cohort}.json`)));
    assert.equal(await page.evaluate(() => window.injected), undefined);
    assert.ok(await page.evaluate(() => window.fetch === window.originalNative.fetch && Storage.prototype.setItem === window.originalNative.storage));
    await navigate(page, `?study=wave1&participant=QA_ISOLATED&cohort=${cohort}`);
    assert.equal(await page.locator('[data-edition]').count(), 1);
    assert.equal(await page.locator('[data-study-phase]').count(), 0);
    await context.close();
    console.log(`Browser: ${cohort}, ${width}px, both cases + recovery + debrief + export passed`);
  }
  const report = analyze(study, completed);
  assert.equal(report.summary.completed, 2); assert.equal(report.summary.metrics.identity_rei, 4);
  await writeFile(join(output, 'analysis.json'), JSON.stringify(report, null, 2));

  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, acceptDownloads: true });
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  await navigate(page);
  assert.equal(await page.locator('[data-edition]').count(), 3);
  const assetPaths = [...new Set((await Promise.all(catalog.publications.map(item => publication(item.editionId)))).flatMap(pkg => pkg.assets.map(asset => asset.path)))];
  await page.evaluate(async paths => {
    for (const path of paths) {
      const image = new Image(); image.src = new URL(path, location.href).href;
      await image.decode();
      if (image.naturalWidth === 0 || image.naturalHeight === 0) throw new Error(`Asset cannot be decoded: ${path}`);
    }
  }, assetPaths);
  await layout(page); await page.screenshot({ path: join(output, 'collection.png'), fullPage: true });

  // Run the identical storage contract against a real IndexedDB implementation.
  const suite = await build({ absWorkingDir: root, stdin: { resolveDir: root, contents: `import { IndexedDBRepository } from './adapters/storage/indexeddb.mjs'; import { repositoryContract } from './verification/repository-contract.mjs'; export async function run() { const repository = new IndexedDBRepository('qa-contract'); try { await repositoryContract(repository); } finally { await repository.close(); } }` }, bundle: true, format: 'esm', write: false });
  await page.route('**/__verification__/repository.mjs', route => route.fulfill({ status: 200, contentType: 'text/javascript', body: suite.outputFiles[0].text }));
  await page.evaluate(async () => { const module = await import('./__verification__/repository.mjs'); await module.run(); });

  const editionId = 'the-2330-message.stage';
  await page.locator(`[data-edition="${editionId}"]`).click(); await settle(page);
  await act(page, { type: 'advance', payload: {} });
  const exported = await save(page, 'web-to-terminal.json');
  // The terminal client accepts the browser checkpoint, continues it in SQLite,
  // then exports a checkpoint that a fresh browser can continue again.
  const commandsPath = join(output, 'terminal-commands.json');
  await writeFile(commandsPath, JSON.stringify([{ type: 'advance', payload: {} }]));
  const terminal = spawn(process.execPath, ['tools/play.mjs', '--import', join(output, 'web-to-terminal.json'), '--db', join(output, `terminal-${Date.now()}`), '--commands', commandsPath, '--export', join(output, 'terminal-to-web.json')], { cwd: root, stdio: ['ignore','pipe','pipe'] });
  let terminalError = ''; terminal.stderr.on('data', data => { terminalError += data; }); terminal.stdout.resume();
  const [code] = await once(terminal, 'exit'); assert.equal(code, 0, terminalError);
  const transferred = await readJSON(join(output, 'terminal-to-web.json'));
  assert.equal(transferred.id, exported.id); assert.equal(transferred.revision, exported.revision + 1);
  const fresh = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const freshPage = await fresh.newPage(); await navigate(freshPage);
  await freshPage.locator('.save-tools summary').click();
  await freshPage.locator('input[type="file"]').setInputFiles(join(output, 'terminal-to-web.json')); await settle(freshPage);
  await freshPage.locator('[data-player="authored"]').waitFor();
  await playAuthored(freshPage, editionId, { start: transferred.state.nodeId });
  await fresh.close(); await navigate(page);

  await page.locator('[data-edition="the-unwritten-alibi.inquiry"]').click(); await settle(page);
  await page.getByRole('textbox', { name: '質問', exact: true }).fill('記録を教えて');
  await page.getByRole('button', { name: '質問する', exact: true }).click(); await settle(page);
  await page.getByRole('textbox', { name: '質問', exact: true }).fill('鍵の持ち主を教えて');
  await page.getByRole('button', { name: '質問する', exact: true }).click(); await settle(page);
  await act(page, { type: 'hypothesize', payload: { roleId: 'archivist' } });
  await act(page, { type: 'hypothesize', payload: { roleId: null } });
  const inquiry = await save(page, 'inquiry.json');
  await page.reload(); await settle(page);
  assert.deepEqual(await save(page, 'inquiry-resumed.json'), inquiry);
  await layout(page); await page.screenshot({ path: join(output, 'inquiry.png'), fullPage: true });
  await act(page, { type: 'close', payload: { roleId: inquiry.state.instance.allegationRoleId } });
  const concluded = await save(page, 'inquiry-concluded.json');
  await page.reload(); await settle(page);
  assert.deepEqual(await save(page, 'inquiry-concluded-resumed.json'), concluded);
  assert.equal(await page.locator('[data-command="close"]').count(), 0);
  assert.ok((await page.locator('.feedback').textContent()).includes('このプレイはここで終わります'));
  await page.locator('[data-finish-inquiry]').click(); await settle(page);
  await context.close();
  assert.deepEqual(errors, []);
  console.log('Browser: IndexedDB contracts, Web → terminal → Web save transfer, generated inquiry passed');
  console.log(`Screenshots and verification exports: ${output}`);
} catch (error) {
  for (const [index, context] of (browser?.contexts() || []).entries()) {
    await context.pages()[0]?.screenshot({ path: join(output, `failure-${index}.png`), fullPage: true }).catch(() => {});
  }
  throw error;
} finally {
  await browser?.close();
  if (server && server.exitCode === null) { server.kill('SIGTERM'); await once(server, 'exit').catch(() => {}); }
}
