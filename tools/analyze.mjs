import { readdir, stat, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { parseArgs } from 'node:util';
import { analyze } from '../domains/research/analyze.mjs';
import { root, readJSON } from './workspace.mjs';

const { values, positionals } = parseArgs({ allowPositionals: true, options: { study: { type: 'string', default: 'wave1' }, output: { type: 'string' } } });
if (!positionals.length) throw new Error('Usage: npm run analyze -- <export.json or directory> [--study wave1] [--output report.json]');
const paths = [];
for (const input of positionals) {
  const path = resolve(input);
  if ((await stat(path)).isDirectory()) paths.push(...(await readdir(path)).filter(name => name.endsWith('.json')).sort().map(name => join(path, name)));
  else paths.push(path);
}
const report = analyze(await readJSON(resolve(root, 'dist/site/studies', `${values.study}.json`)), await Promise.all(paths.map(readJSON)));
console.log(JSON.stringify(report, null, 2));
if (values.output) await writeFile(resolve(values.output), `${JSON.stringify(report, null, 2)}\n`);
