import { readFile, realpath } from 'node:fs/promises';
import { resolve, relative, dirname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { digest } from '../foundation/data.mjs';
import { requireCondition } from '../foundation/errors.mjs';
import { modules } from '../implementations/modules.mjs';

export const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export async function readJSON(path) { return JSON.parse(await readFile(path, 'utf8')); }
export async function sourcePath(path) {
  const absolute = await realpath(resolve(root, path));
  requireCondition(absolute.startsWith(`${root}${sep}`), 'INVALID_SOURCE_PATH', 'Source must remain in the repository');
  return absolute;
}
export async function implementationLock() {
  const dependencyLock = await readJSON(resolve(root, 'package-lock.json'));
  const entries = await Promise.all(modules.map(async item => {
    const result = await build({ absWorkingDir: root, entryPoints: [item.entry], bundle: true, write: false, metafile: true, format: 'esm', platform: 'neutral', packages: 'external', logLevel: 'silent' });
    const sources = [...Object.keys(result.metafile.inputs), ...(item.resources || [])].sort();
    const contents = await Promise.all(sources.map(async path => [relative(root, resolve(root, path)).replaceAll(sep, '/'), await readFile(resolve(root, path), 'utf8')]));
    return [item.id, { id: item.id, contract: item.contract, digest: await digest({ sources: contents, dependencyLock }), sources }];
  }));
  return Object.fromEntries(entries);
}
