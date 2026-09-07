import { resolve } from 'node:path';
import { readFile, writeFile } from 'node:fs/promises';
import { createInterface } from 'node:readline/promises';
import { parseArgs } from 'node:util';
import { openHost } from '../foundation/host.mjs';
import { requireCondition } from '../foundation/errors.mjs';
import { resolveImplementation } from '../foundation/packages.mjs';
import { SQLiteRepository } from '../adapters/storage/sqlite.mjs';
import { engineRegistry, bindImplementations, defaultCapabilities } from '../products/mystery-prince/runtime.mjs';
import { authoredTerminal, inquiryTerminal } from '../implementations/presenters/terminal.mjs';
import { root, readJSON, implementationLock } from './workspace.mjs';
import { canonical } from '../foundation/data.mjs';

const { values } = parseArgs({ options: { edition: { type: 'string' }, resume: { type: 'string' }, import: { type: 'string' }, export: { type: 'string' }, commands: { type: 'string' }, seed: { type: 'string' }, db: { type: 'string', default: 'build/play-saves' }, list: { type: 'boolean' } } });
const catalog = await readJSON(resolve(root, 'dist/site/catalog.json'));
if (values.list || (!values.edition && !values.resume && !values.import)) {
  catalog.publications.forEach(item => console.log(`${item.editionId}\t${item.title}`));
} else {
  const lock = await readJSON(resolve(root, 'dist/implementation-lock.json'));
  requireCondition(canonical(lock) === canonical(await implementationLock()), 'BUILD_STALE', 'Source changed; run npm run build');
  const repository = new SQLiteRepository(resolve(values.db));
  let readline;
  try {
    const imported = values.import ? JSON.parse(await readFile(resolve(values.import), 'utf8')) : null;
    const saved = values.resume ? (await repository.load(values.resume))?.value : imported;
    const item = catalog.publications.find(item => saved ? item.publicationId === saved.publicationId : item.editionId === values.edition);
    requireCondition(item, 'EDITION_UNAVAILABLE', 'Choose a published edition');
    const publication = await readJSON(resolve(root, 'dist/site', item.path));
    const presenters = bindImplementations([authoredTerminal, inquiryTerminal], lock);
    const descriptor = publication.presenters.find(item => presenters.has(item.id));
    requireCondition(descriptor, 'PRESENTATION_UNAVAILABLE', 'No terminal presentation');
    const presenter = resolveImplementation(presenters, descriptor);
    const host = await openHost({ publication, registry: engineRegistry(lock), repository, capabilities: defaultCapabilities() });
    let sessionId;
    if (imported) sessionId = await host.restore(imported);
    else if (saved) sessionId = saved.id;
    else sessionId = (await host.create({ scope: 'play/local', ...(values.seed ? { seed: values.seed } : {}) })).sessionId;
    const checkpoint = await host.snapshot(sessionId);
    if (checkpoint.pending || checkpoint.status === 'initializing') await host.retryPending(sessionId);
    console.log(`Session: ${sessionId}`);
    if (values.commands) {
      const commands = await readJSON(resolve(values.commands));
      for (const action of commands) {
        const current = await host.observe(sessionId);
        await host.dispatch(sessionId, { id: crypto.randomUUID(), expectedRevision: current.revision, type: action.type, payload: action.payload });
      }
      console.log(presenter.render((await host.observe(sessionId)).observation));
    } else {
      readline = createInterface({ input: process.stdin, output: process.stdout });
      while (true) {
        const current = await host.observe(sessionId);
        console.log(`\n${presenter.render(current.observation)}\n`);
        if (current.status !== 'active') break;
        current.observation.actions.forEach((action, index) => console.log(`${index + 1}. ${action.label}`));
        const answer = (await readline.question('番号を選択 / qで保存して終了: ')).trim();
        if (answer === 'q') break;
        const action = current.observation.actions[Number(answer) - 1];
        if (!action) { console.log('表示された番号を選んでください。'); continue; }
        await host.dispatch(sessionId, { id: crypto.randomUUID(), expectedRevision: current.revision, type: action.type, payload: action.payload });
      }
    }
    if (values.export) await writeFile(resolve(values.export), JSON.stringify(await host.snapshot(sessionId), null, 2) + '\n');
  } finally { readline?.close(); repository.close(); }
}
