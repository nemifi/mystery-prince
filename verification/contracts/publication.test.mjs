import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, readFile, readdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildProject } from '../../tools/build.mjs';
import { readJSON, root, sourcePath } from '../../tools/workspace.mjs';
import { profiles } from '../../experience-profiles/registry.mjs';
import { catalog, publication, site, lock } from '../helpers.mjs';
import { digestBytes, copy } from '../../foundation/data.mjs';
import { verifyPublication } from '../../foundation/packages.mjs';
import { HttpSource, VerifiedAssets } from '../../adapters/distribution/http.mjs';
import { verifyAssetFormat } from '../../tools/asset-format.mjs';

test('every publication and asset verifies; source rebuild is deterministic', async () => {
  for (const item of catalog.publications) {
    const pkg = await verifyPublication(await publication(item.editionId));
    assert.equal(pkg.id, item.publicationId);
    for (const asset of pkg.assets) {
      const bytes = await readFile(join(site, asset.path));
      assert.equal(bytes.byteLength, asset.bytes); assert.equal(await digestBytes(bytes), asset.digest);
    }
    const corrupt = copy(pkg); corrupt.content.title += ' modified';
    await assert.rejects(verifyPublication(corrupt), { code: 'INTEGRITY_MISMATCH' });
  }
  const output = await mkdtemp(join(tmpdir(), 'mp-build-'));
  try {
    const rebuilt = await buildProject({ output });
    assert.deepEqual(rebuilt.catalog, catalog);
    assert.deepEqual(rebuilt.lock, lock);
    const originalApp = await readdir(join(site, 'app')), rebuiltApp = await readdir(join(output, 'site/app'));
    assert.deepEqual(rebuiltApp, originalApp);
    for (const file of originalApp) assert.deepEqual(await readFile(join(site, 'app', file)), await readFile(join(output, 'site/app', file)));
  } finally { await rm(output, { recursive: true, force: true }); }
});

test('recasting updates text and portraits without rewriting any rule', async () => {
  const profile = profiles.get('authored-mystery/1');
  const base = join(root, 'works/the-2330-message');
  const edition = (await readJSON(join(base, 'realizations.json')))[0];
  const source = await profile.load({ local: path => readJSON(join(base, path)), global: path => readJSON(join(root, path)) }, edition);
  const original = profile.compile(source);
  source.characters.minato.name = 'HARU';
  const recast = profile.compile(source);
  assert.deepEqual(recast.content.rules, original.content.rules);
  assert.ok(JSON.stringify(recast.content.performance).includes('HARU'));
  assert.ok(!JSON.stringify(recast.content.performance).includes('MINATO'));
  source.casting.find(item => item.characterId === 'minato').portraitAsset = 'replacement-portrait';
  source.assets['replacement-portrait'] = source.assets['portrait-physician'];
  assert.ok(profile.compile(source).requiredAssets.includes('replacement-portrait'));
  source.overlay = { patches: [{ cueId: 'beat-00', field: 'text', before: 'stale copy', after: 'new copy' }] };
  assert.throws(() => profile.compile(source), { code: 'OVERLAY_CONFLICT' });
});

test('research editions are neutral at compile time and preserve the same mechanics', async () => {
  for (const work of ['the-2330-message','the-sealed-express']) {
    const standard = await publication(`${work}.stage`), blind = await publication(`${work}.wave1`);
    assert.deepEqual(standard.content.rules, blind.content.rules);
    assert.doesNotMatch(JSON.stringify(blind.content.performance), /前の事件|前に俺が何者|前より|次の俺|そういうところ、REI|役が変わ|別の人生|EPISODE 0[12]/);
    assert.doesNotMatch(JSON.stringify(blind.content), /\{\{/);
  }
});

test('foundation and rule engines cannot import products, UI, storage or old runtime', async () => {
  for (const file of (await readdir(join(root, 'foundation'))).filter(file => file.endsWith('.mjs'))) {
    const source = await readFile(join(root, 'foundation', file), 'utf8');
    assert.doesNotMatch(source, /from\s+['"]\.\.\/|\b(document|window|localStorage|indexedDB)\b|node:|prototype\//);
  }
  for (const id of ['authored-engine','inquiry-engine']) {
    for (const path of lock[id].sources) assert.match(path, /^(implementations\/engines|domains|foundation)\//);
  }
  const report = await readJSON(join(root, 'dist/build-report.json'));
  assert.ok(!report.browserInputs.some(path => /prototype\/|adapters\/execution|storage\/sqlite|tools\//.test(path)));
  assert.ok(report.reports.every(item => ['requires-human-playtest-after-migration', 'architecture-reference-not-wave1'].includes(item.editorial.humanReview)));
  assert.ok(lock['authored-presenter'].sources.includes('apps/web/styles.css'));
  assert.ok(lock['study-runtime'].sources.includes('domains/research/study.mjs'));
  assert.equal((await readJSON(join(site, 'studies/wave1.json'))).implementationDigest, lock['study-runtime'].digest);
  await assert.rejects(sourcePath('../outside'), error => ['ENOENT','INVALID_SOURCE_PATH'].includes(error.code));
});

test('HTTP distribution stays in its subpath and rejects modified asset bytes', async () => {
  const pkg = await publication('the-2330-message.stage');
  const source = new HttpSource('https://example.test/game/', async () => new Response(new Uint8Array([1,2,3])));
  for (const path of ['../secret','https://other.test/data','/outside']) assert.throws(() => source.url(path), { code: 'INVALID_RESOURCE_PATH' });
  const assets = new VerifiedAssets(source);
  await assert.rejects(assets.forPublication(pkg), { code: 'ASSET_INTEGRITY' });
  assets.dispose();
});

test('asset publication rejects undecodable headers and externally linked SVG sources', async () => {
  assert.throws(() => verifyAssetFormat(Buffer.from([0xe8,0xa8,0x79,0x71]), 'jpg', 'broken.jpg'), { code: 'ASSET_FORMAT' });
  assert.throws(() => verifyAssetFormat(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><image href = "https://example.test/image"/></svg>'), 'svg', 'remote.svg'), { code: 'ASSET_FORMAT' });
  assert.equal(verifyAssetFormat(await readFile(join(root, 'assets/artwork/sealed-express.svg')), 'svg', 'sealed-express.svg'), 'image/svg+xml');
});
