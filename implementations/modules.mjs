// Composition metadata. The foundation never imports this registry.
export const modules = [
  { id: 'authored-engine', contract: 'authored-mystery/1', entry: 'implementations/engines/authored.mjs' },
  { id: 'python-authored-engine', contract: 'authored-mystery/1', entry: 'adapters/execution/python-authored.mjs', resources: ['implementations/engines/authored-reference.py'] },
  { id: 'inquiry-engine', contract: 'generated-inquiry/1', entry: 'implementations/engines/inquiry.mjs' },
  { id: 'authored-presenter', contract: 'authored-stage/1', entry: 'implementations/presenters/authored.mjs', resources: ['apps/web/styles.css'] },
  { id: 'inquiry-presenter', contract: 'inquiry-stage/1', entry: 'implementations/presenters/inquiry.mjs', resources: ['apps/web/styles.css'] },
  { id: 'authored-terminal', contract: 'authored-stage/1', entry: 'implementations/presenters/terminal.mjs' },
  { id: 'inquiry-terminal', contract: 'inquiry-stage/1', entry: 'implementations/presenters/terminal.mjs' },
  { id: 'study-runtime', contract: 'research-flow/1', entry: 'apps/web/main.mjs', resources: ['apps/web/styles.css','apps/web/index.html'] }
];
