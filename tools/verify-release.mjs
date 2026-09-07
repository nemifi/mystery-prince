import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { implementationLock, readJSON, root } from './workspace.mjs';
import { canonical, digest, digestBytes } from '../foundation/data.mjs';
import { verifyPublication } from '../foundation/packages.mjs';
import { requireCondition } from '../foundation/errors.mjs';

const site = join(root, 'dist/site');
const catalog = await readJSON(join(site, 'catalog.json'));
const lock = await readJSON(join(root, 'dist/implementation-lock.json'));
requireCondition(canonical(lock) === canonical(await implementationLock()), 'STALE_BUILD', 'Rebuild after implementation changes');
const assets = new Set();
for (const item of catalog.publications) {
  const pkg = await verifyPublication(await readJSON(join(site, item.path)));
  requireCondition(pkg.id === item.publicationId, 'CATALOG_INVALID', 'Catalog points to a different publication');
  for (const asset of pkg.assets) {
    const bytes = await readFile(join(site, asset.path));
    requireCondition(bytes.length === asset.bytes && await digestBytes(bytes) === asset.digest, 'ASSET_INTEGRITY', `Invalid asset ${asset.id}`);
    assets.add(asset.digest);
  }
}
for (const reference of catalog.studies) {
  const { revision, ...body } = await readJSON(join(site, reference.path));
  requireCondition(await digest(body) === revision, 'STUDY_REVISION_MISMATCH', 'Study revision does not match its definition');
  const frozen = await readJSON(join(root, 'ops', `${reference.id}-release.json`));
  requireCondition(frozen.studyId === body.id && frozen.studyRevision === revision && canonical(frozen.publications) === canonical(body.publications), 'STUDY_FREEZE_STALE', 'Run npm run freeze:study after changing a study release');
}
const report = await readJSON(join(root, 'dist/build-report.json'));
requireCondition(await digest(catalog) === report.catalogDigest, 'CATALOG_INVALID', 'Catalog differs from build report');
console.log(`Release verified: ${catalog.publications.length} publications, ${assets.size} asset revisions, ${catalog.studies.length} study; no legacy runtime required.`);
