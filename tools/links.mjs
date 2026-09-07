import { parseArgs } from 'node:util';
import { writeFile } from 'node:fs/promises';
import { assignments, participantURL } from '../domains/research/assignments.mjs';

const { values } = parseArgs({ options: { base: { type: 'string', default: 'https://nemifi.github.io/mystery-prince/' }, count: { type: 'string', default: '20' }, seed: { type: 'string', default: '20260904' }, output: { type: 'string' } } });
const rows = assignments(Number(values.count), Number(values.seed));
const csv = ['participant_id,cohort,url', ...rows.map(row => `${row.participantId},${row.cohort},${participantURL(values.base, row)}`)].join('\n') + '\n';
if (values.output) await writeFile(values.output, csv); else process.stdout.write(csv);
