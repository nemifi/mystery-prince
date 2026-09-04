import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const BASE = process.env.MP_SMOKE_URL || 'http://127.0.0.1:8000/prototype/';
const root = process.cwd();
const episodeA = JSON.parse(await fs.readFile(path.join(root, 'prototype/content/episode-a.json'), 'utf8'));
const episodeB = JSON.parse(await fs.readFile(path.join(root, 'prototype/content/episode-b.json'), 'utf8'));
const episodes = new Map([[episodeA.title, episodeA], [episodeB.title, episodeB]]);

function correctReasonLabels(episode) {
  return new Set(
    episode.events
      .filter(event => event.type === 'reasoning')
      .flatMap(event => event.options.filter(option => option.correct).map(option => option.label))
  );
}

const correctReasonByTitle = new Map([...episodes].map(([title, ep]) => [title, correctReasonLabels(ep)]));
const culpritByTitle = new Map([...episodes].map(([title, ep]) => [title, ep.events.find(event => event.type === 'accuse')?.correct]));

function currentTitle(progressText = '') {
  for (const title of episodes.keys()) if (progressText.includes(title)) return title;
  return null;
}

async function runScenario(browser, pid, order) {
  const context = await browser.newContext({ acceptDownloads: true, viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  const errors = [];
  const badResponses = [];
  page.on('pageerror', error => errors.push(String(error)));
  page.on('requestfailed', request => errors.push(`request failed: ${request.url()} ${request.failure()?.errorText || ''}`));
  page.on('response', response => {
    if (response.status() >= 400) badResponses.push(`${response.status()} ${response.url()}`);
  });

  await page.goto(`${BASE}?pid=${pid}&order=${order}&reset=1`, { waitUntil: 'networkidle' });
  await page.waitForSelector('.episode-card');

  const firstTitle = order === 'AB' ? episodeA.title : episodeB.title;
  const firstCardTitle = (await page.locator('.episode-card h2').first().textContent())?.trim();
  if (firstCardTitle !== firstTitle) throw new Error(`${pid}: expected first case ${firstTitle}, got ${firstCardTitle}`);
  if (await page.locator('.episode-card').count() !== 1) throw new Error(`${pid}: blind ordered flow should expose exactly one unfinished case`);

  const portraitStylesSeen = new Set();
  let completedCases = 0;

  while (completedCases < 2) {
    await page.locator('.episode-card').first().click();
    await page.waitForSelector('.shell');

    while (true) {
      const progress = (await page.locator('.progress').textContent()) || '';
      const title = currentTitle(progress);
      if (!title) throw new Error(`${pid}: could not identify current episode from ${progress}`);

      const portrait = page.locator('.portrait').first();
      if (await portrait.count()) {
        const bg = await portrait.evaluate(el => getComputedStyle(el).backgroundImage);
        if (bg.includes('-a.jpg')) portraitStylesSeen.add('A');
        if (bg.includes('-b.jpg')) portraitStylesSeen.add('B');
      }

      if (await page.locator('[data-finish]').count()) {
        await page.locator('[data-finish]').click();
        completedCases += 1;
        break;
      }

      if (await page.locator('[data-reason]').count()) {
        const expected = correctReasonByTitle.get(title);
        const buttons = page.locator('[data-reason]');
        let clicked = false;
        for (let i = 0; i < await buttons.count(); i += 1) {
          const text = (await buttons.nth(i).textContent())?.trim();
          if (expected?.has(text)) {
            await buttons.nth(i).click();
            clicked = true;
            break;
          }
        }
        if (!clicked) throw new Error(`${pid}: correct reasoning option not found for ${title}`);
        await page.waitForTimeout(500);
        continue;
      }

      if (await page.locator('[data-accuse]').count()) {
        const culprit = culpritByTitle.get(title);
        if (!culprit) throw new Error(`${pid}: no culprit configured for ${title}`);
        await page.locator(`[data-accuse="${culprit}"]`).click();
        await page.waitForTimeout(100);
        continue;
      }

      if (await page.locator('[data-option]').count()) {
        await page.locator('[data-option]').first().click();
        await page.waitForTimeout(300);
        continue;
      }

      if (await page.locator('[data-next]').count()) {
        await page.locator('[data-next]').click();
        await page.waitForTimeout(80);
        continue;
      }

      throw new Error(`${pid}: no actionable control found; progress=${progress}`);
    }

    if (completedCases === 1) {
      await page.waitForSelector('.episode-card');
      if (await page.locator('.episode-card').count() !== 1) throw new Error(`${pid}: after first completion exactly one unfinished case should be shown`);
    }
  }

  if (!portraitStylesSeen.has('A') || !portraitStylesSeen.has('B')) {
    throw new Error(`${pid}: role-specific A/B portrait assets were not both observed (${[...portraitStylesSeen]})`);
  }

  await page.waitForSelector('[data-blind-form]');
  const preRevealText = await page.locator('[data-debrief]').innerText();
  if (preRevealText.includes('同じ3人を') || preRevealText.includes('別の人生・役')) {
    throw new Error(`${pid}: star-system concept leaked before blind response`);
  }
  await page.locator('textarea[name="observation"]').fill('三人とも事件ごとに立場が大きく違うが、名前と雰囲気に共通点を感じた。');
  await page.locator('input[name="favorite_case"][value="equal"]').check();
  await page.locator('input[name="next_prince_blind"][value="KAI"]').check();
  await page.locator('[data-blind-form] button[type="submit"]').click();

  await page.waitForSelector('[data-reveal]');
  await page.locator('[data-reveal]').click();
  await page.waitForSelector('[data-revealed-form]');
  const postRevealText = await page.locator('[data-debrief]').innerText();
  if (!postRevealText.includes('同じ3人')) throw new Error(`${pid}: concept reveal did not occur after blind response`);

  for (const name of ['identity_rei', 'identity_minato', 'identity_kai', 'recast', 'character_mystery_synergy', 'mystery_a', 'mystery_b']) {
    await page.locator(`input[name="${name}"][value="4"]`).check();
  }
  await page.locator('input[name="emotion_reasoning"][value="yes"]').check();
  await page.locator('input[name="next_prince"][value="KAI"]').check();
  await page.locator('textarea[name="next_role"]').fill('KAIを弁護士役で見たい');
  await page.locator('[data-revealed-form] button[type="submit"]').click();

  const downloadPromise = page.waitForEvent('download');
  await page.locator('[data-export-full]').click();
  const download = await downloadPromise;
  const downloadPath = await download.path();
  if (!downloadPath) throw new Error(`${pid}: no exported download path`);
  const payload = JSON.parse(await fs.readFile(downloadPath, 'utf8'));
  if (payload.participant_id !== pid) throw new Error(`${pid}: export participant mismatch ${payload.participant_id}`);
  if (payload.assigned_order !== order) throw new Error(`${pid}: export order mismatch ${payload.assigned_order}`);
  if (!payload.debrief?.blind || !payload.debrief?.revealed) throw new Error(`${pid}: nested blind/revealed debrief missing`);
  const completions = payload.play_log.filter(row => row.type === 'episode_complete');
  if (completions.length !== 2) throw new Error(`${pid}: expected two episode completions, got ${completions.length}`);

  if (errors.length || badResponses.length) {
    throw new Error(`${pid}: browser/network errors\n${[...errors, ...badResponses].join('\n')}`);
  }

  await context.close();
  console.log(`PASS browser Wave 1 smoke: ${pid} ${order}`);
}

const browser = await chromium.launch({ headless: true });
try {
  await runScenario(browser, 'P000A', 'AB');
  await runScenario(browser, 'P000B', 'BA');
} finally {
  await browser.close();
}
