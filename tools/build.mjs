import { mkdir, readdir, readFile, writeFile, rm, copyFile } from 'node:fs/promises';
import { resolve, join, extname } from 'node:path';
import { pathToFileURL } from 'node:url';
import { build as bundle } from 'esbuild';
import { root, sourcePath, readJSON, implementationLock } from './workspace.mjs';
import { profiles } from '../experience-profiles/registry.mjs';
import { digest, digestBytes, canonical, unique } from '../foundation/data.mjs';
import { requireCondition } from '../foundation/errors.mjs';
import { sealPublication } from '../foundation/packages.mjs';
import { validateStudy } from '../domains/research/study.mjs';
import { checkBrand } from '../products/mystery-prince/editorial.mjs';
import { verifyAssetFormat } from './asset-format.mjs';

const saveJSON = (path, value) => writeFile(path, `${JSON.stringify(value, null, 2)}\n`);
export async function buildProject({ output = resolve(root, 'dist') } = {}) {
  const site = join(output, 'site');
  await rm(output, { recursive: true, force: true });
  await Promise.all(['assets','publications','studies'].map(path => mkdir(join(site, path), { recursive: true })));
  await mkdir(join(output, 'reports'), { recursive: true });
  const lock = await implementationLock();
  await saveJSON(join(output, 'implementation-lock.json'), lock);
  const descriptor = id => { const { sources, ...value } = lock[id]; return value; };
  const publications = [], reports = [];
  const workDirectories = (await readdir(join(root, 'works'), { withFileTypes: true })).filter(entry => entry.isDirectory()).map(entry => entry.name).sort();
  for (const directory of workDirectories) {
    const base = `works/${directory}`;
    const editions = await readJSON(await sourcePath(`${base}/realizations.json`));
    for (const edition of editions) {
      const profile = profiles.get(edition.profile);
      requireCondition(profile, 'UNSUPPORTED_PROFILE', `Unknown profile ${edition.profile}`);
      const inputs = {};
      const read = async path => { const value = await readJSON(await sourcePath(path)); inputs[path] = value; return value; };
      const source = await profile.load({ local: path => read(`${base}/${path}`), global: read }, edition);
      const compiled = profile.compile(source);
      const editorial = checkBrand({ intent: source.intent, cast: compiled.content.roles, assets: source.assets });
      const assets = [];
      for (const id of [...new Set(compiled.requiredAssets)].sort()) {
        const asset = source.assets[id];
        requireCondition(typeof asset.source === 'string' && typeof asset.alt === 'string' && asset.alt.length > 0, 'ASSET_INVALID', 'Assets need a source and description');
        const path = await sourcePath(asset.source), bytes = await readFile(path), hash = await digestBytes(bytes);
        const extension = extname(path).slice(1).toLowerCase();
        const mediaType = verifyAssetFormat(bytes, extension, path);
        const target = `assets/${hash}.${extension}`;
        await copyFile(path, join(site, target));
        assets.push({ id, path: target, digest: hash, mediaType, bytes: bytes.length });
      }
      const publication = await sealPublication({ schema: 'publication/1', work: { id: source.intent.id, title: source.intent.title, summary: source.intent.summary }, editionId: edition.id, profile: edition.profile, engine: descriptor(profile.engine), presenters: profile.presenters.map(descriptor), hostContract: 'session/1', permissions: profile.permissions, content: compiled.content, assets, provenance: { sourceDigest: await digest({ inputs, edition }), builder: 'publication-builder/1' } });
      const path = `publications/${publication.id}.json`;
      await saveJSON(join(site, path), publication);
      publications.push({ editionId: edition.id, publicationId: publication.id, path, title: publication.work.title, summary: publication.work.summary, profile: publication.profile, cover: assets.find(asset => asset.id === 'background').path, roles: compiled.content.roles.map(({ name, label }) => ({ name, label })) });
      const report = { editionId: edition.id, publicationId: publication.id, sources: Object.keys(inputs).sort(), sourceMap: compiled.sourceMap, editorial };
      reports.push(report); await saveJSON(join(output, 'reports', `${edition.id}.json`), report);
    }
  }
  unique(publications.map(item => item.editionId), 'edition');
  const product = await readJSON(join(root, 'products/mystery-prince/product.json'));
  const studies = [];
  for (const studyPath of product.studies) {
    const source = await readJSON(await sourcePath(studyPath));
    const publicationIds = Object.fromEntries(source.editions.map(edition => {
      const item = publications.find(p => p.editionId === edition);
      requireCondition(item, 'INVALID_STUDY', `Study refers to absent edition ${edition}`);
      return [edition, item.publicationId];
    }));
    const { schema, ...fields } = source;
    const body = { schema: 'study/1', ...fields, publications: publicationIds, implementationDigest: lock['study-runtime'].digest };
    const study = { ...body, revision: await digest(body) };
    validateStudy(study);
    const path = `studies/${study.id}.json`;
    await saveJSON(join(site, path), study); studies.push({ id: study.id, path });
  }
  requireCondition(product.discoveryEditions.every(id => publications.some(item => item.editionId === id)), 'CATALOG_INVALID', 'Catalog references an absent edition');
  const catalog = { schema: 'discovery/1', product: { id: product.id, title: product.title, intro: product.intro }, discoveryEditions: product.discoveryEditions, publications, studies };
  await saveJSON(join(site, 'catalog.json'), catalog);
  const bundled = await bundle({ absWorkingDir: root, entryPoints: ['apps/web/main.mjs'], outdir: join(site, 'app'), bundle: true, format: 'esm', platform: 'browser', target: ['es2022'], entryNames: '[name]-[hash]', assetNames: '[name]-[hash]', metafile: true, sourcemap: false, minify: true, define: { __MODULE_LOCK__: JSON.stringify(lock) } });
  const outputs = Object.keys(bundled.metafile.outputs);
  const entry = outputs.find(path => bundled.metafile.outputs[path].entryPoint === 'apps/web/main.mjs' && path.endsWith('.js'));
  const scriptPath = `app/${entry.split('/').at(-1)}`;
  await copyFile(join(root, 'apps/web/styles.css'), join(site, 'styles.css'));
  const html = (await readFile(join(root, 'apps/web/index.html'), 'utf8')).replace('APP_ENTRY', scriptPath);
  await writeFile(join(site, 'index.html'), html);
  await saveJSON(join(output, 'build-report.json'), { schema: 'build-report/1', publications: publications.length, profiles: [...new Set(publications.map(item => item.profile))], catalogDigest: await digest(catalog), implementationLock: lock, browserInputs: Object.keys(bundled.metafile.inputs).sort(), reports });
  return { site, catalog, publications, lock };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const result = await buildProject();
  console.log(`Built ${result.publications.length} immutable publications across ${new Set(result.publications.map(item => item.profile)).size} profiles: ${result.site}`);
}
