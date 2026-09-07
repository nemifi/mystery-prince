import { parseArgs } from 'node:util';
import { writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { readJSON, root, implementationLock } from './workspace.mjs';
import { canonical } from '../foundation/data.mjs';
import { requireCondition } from '../foundation/errors.mjs';
import { validateStudy } from '../domains/research/study.mjs';

const { values } = parseArgs({ options: { study: { type: 'string', default: 'wave1' }, output: { type: 'string', default: 'ops/wave1-release.json' } } });
const lock = await readJSON(join(root, 'dist/implementation-lock.json'));
requireCondition(canonical(lock) === canonical(await implementationLock()), 'STALE_BUILD', 'Rebuild before freezing a study');
const study = await readJSON(join(root, 'dist/site/studies', `${values.study}.json`));
validateStudy(study);
const record = { schema: 'study-release/1', studyId: study.id, studyRevision: study.revision, publications: study.publications };
await writeFile(resolve(values.output), `${JSON.stringify(record, null, 2)}\n`);
console.log(`Recorded ${study.id} revision ${study.revision}`);
