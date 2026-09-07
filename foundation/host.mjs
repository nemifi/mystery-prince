import { validateEnvelope, validateSession } from './session.mjs';
import { copy, immutable, canonical } from './data.mjs';
import { requireCondition, ContractError } from './errors.mjs';
import { verifyPublication, resolveImplementation } from './packages.mjs';

// The host owns lifecycle and operation receipts. The selected implementation
// owns the opaque state, command vocabulary, observations and completion rules.
export async function openHost({ publication, registry, repository, capabilities = new Map(), clock = () => new Date().toISOString(), makeId = () => crypto.randomUUID() }) {
  const pkg = await verifyPublication(publication);
  const engine = resolveImplementation(registry, pkg.engine);
  engine.validateContent(pkg.content);
  for (const permission of engine.requires || []) {
    requireCondition(pkg.permissions.includes(permission), 'PERMISSION_DENIED', `${permission} was not granted`);
    requireCondition(capabilities.has(permission), 'CAPABILITY_UNAVAILABLE', `${permission} is unavailable`);
  }

  async function read(id) {
    const record = await repository.load(id);
    requireCondition(record, 'SESSION_NOT_FOUND', 'Session does not exist');
    validateSession(record.value);
    requireCondition(record.value.id === id, 'INVALID_CHECKPOINT', 'Stored identity does not match its key');
    requireCondition(record.value.publicationId === pkg.id && record.value.engine === engine.id, 'PUBLICATION_MISMATCH', 'Session belongs to a different publication');
    if (record.value.state !== null) engine.validateState(pkg.content, record.value.state, record.value.status);
    return record;
  }

  async function perform(id, command) {
    validateEnvelope(command);
    const requested = immutable(command);
    let record = await read(id);
    let session = record.value;
    const prior = session.receipts.find(receipt => receipt.command.id === requested.id);
    if (prior) {
      requireCondition(canonical(prior.command) === canonical(requested), 'COMMAND_ID_REUSED', 'A command ID cannot identify different operations');
      return copy(prior.result);
    }
    requireCondition(session.revision === requested.expectedRevision, 'REVISION_CONFLICT', 'The session changed; reload before acting');
    requireCondition(!['completed', 'closed'].includes(session.status), 'SESSION_FINISHED', 'This session has ended');
    if (requested.type === '$initialize') requireCondition(session.status === 'initializing', 'INVALID_COMMAND', 'Initialization is already complete');
    else {
      requireCondition(session.status === 'active', 'SESSION_NOT_READY', 'Initialization is pending');
      engine.validateCommand(requested);
      engine.validateAction(pkg.content, session.state, requested);
    }

    if (session.pending) {
      requireCondition(canonical(session.pending) === canonical(requested), 'SESSION_BUSY', 'Another command is pending');
    } else {
      const next = { ...session, pending: requested };
      const saved = await repository.commit(id, record.token, next);
      if (!saved) throw new ContractError('REVISION_CONFLICT', 'Another operation started');
      record = saved;
      session = saved.value;
    }

    let callIndex = 0;
    const effectRecords = [];
    const context = Object.freeze({
      seed: session.seed,
      invoke: async (capability, input) => {
        requireCondition(pkg.permissions.includes(capability) && (engine.requires || []).includes(capability), 'PERMISSION_DENIED', `${capability} is not granted to this implementation`);
        const provider = capabilities.get(capability);
        requireCondition(provider?.idempotent === true, 'CAPABILITY_CONTRACT', 'External operations must support idempotency keys');
        const key = `${id}/${requested.id}/${callIndex++}`;
        const invocation = { capability, input: copy(input) };
        const previous = await repository.getEffect(key);
        if (previous) {
          requireCondition(canonical(previous.invocation) === canonical(invocation), 'EFFECT_MISMATCH', 'Replay requested different external input');
          effectRecords.push({ key, ...previous });
          return immutable(previous.output);
        }
        const output = copy(await provider.invoke(copy(input), { idempotencyKey: key }));
        const stored = await repository.recordEffect(key, { invocation, provider: provider.id, output });
        requireCondition(canonical(stored.invocation) === canonical(invocation), 'EFFECT_MISMATCH', 'Conflicting external operation');
        effectRecords.push({ key, ...stored });
        return immutable(stored.output);
      }
    });

    // On provider failure the pending command remains durable. retryPending()
    // uses the same operation key and recorded outputs, never a fresh seed.
    const transition = requested.type === '$initialize'
      ? await engine.initialize(immutable(pkg.content), context)
      : await engine.dispatch(immutable(pkg.content), immutable(session.state), requested, context);
    engine.validateState(pkg.content, transition.state, transition.status);
    requireCondition(['active', 'completed'].includes(transition.status) && Array.isArray(transition.events), 'IMPLEMENTATION_CONTRACT', 'Invalid transition result');
    const at = clock();
    const revision = session.revision + 1;
    const events = transition.events.map((event, i) => {
      requireCondition(typeof event.type === 'string' && !event.type.startsWith('session.') && event.payload && typeof event.payload === 'object' && !Array.isArray(event.payload), 'IMPLEMENTATION_CONTRACT', 'Domain events need a non-reserved type and object payload');
      return { id: `${id}:${revision}:${i}`, at, revision, type: event.type, payload: copy(event.payload) };
    });
    if (transition.status === 'completed') events.push({ id: `${id}:${revision}:completed`, at, revision, type: 'session.completed', payload: {} });
    const result = { sessionId: id, revision, status: transition.status, events, observation: copy(await engine.observe(pkg.content, transition.state)) };
    const next = {
      ...session, revision, state: transition.state, status: transition.status, updatedAt: at, pending: null,
      receipts: [...session.receipts, { command: requested, result }], events: [...session.events, ...events], effects: [...session.effects, ...effectRecords]
    };
    validateSession(next);
    const latest = await read(id);
    const finished = latest.value.receipts.find(receipt => receipt.command.id === requested.id);
    if (finished) return copy(finished.result);
    requireCondition(canonical(latest.value.pending) === canonical(requested) && latest.value.revision === session.revision, 'REVISION_CONFLICT', 'Pending operation changed');
    if (!await repository.commit(id, latest.token, next)) {
      const concurrent = (await read(id)).value.receipts.find(receipt => receipt.command.id === requested.id);
      requireCondition(concurrent && canonical(concurrent.command) === canonical(requested), 'REVISION_CONFLICT', 'Concurrent commit; reload the session');
      return copy(concurrent.result);
    }
    return result;
  }

  return Object.freeze({
    publication: pkg,
    async create({ id = makeId(), scope = 'local', seed = makeId() } = {}) {
      const at = clock();
      const session = { schema: 'session/1', id, publicationId: pkg.id, engine: engine.id, scope, revision: 0, status: 'initializing', state: null, seed, startedAt: at, updatedAt: at, pending: null, receipts: [], events: [], effects: [] };
      validateSession(session);
      requireCondition(await repository.create(id, session), 'SESSION_EXISTS', 'Session ID already exists');
      return perform(id, { id: 'initialize', expectedRevision: 0, type: '$initialize', payload: {} });
    },
    dispatch: perform,
    async retryPending(id) {
      const { value } = await read(id);
      requireCondition(value.pending || value.status === 'initializing', 'NO_PENDING_OPERATION', 'There is no interrupted operation to retry');
      return perform(id, value.pending || { id: 'initialize', expectedRevision: 0, type: '$initialize', payload: {} });
    },
    async snapshot(id) { return copy((await read(id)).value); },
    async observe(id) {
      const { value } = await read(id);
      requireCondition(value.state !== null, 'SESSION_NOT_READY', 'Initialization is pending');
      return { sessionId: id, revision: value.revision, status: value.status, pending: value.pending !== null, observation: copy(await engine.observe(pkg.content, value.state)) };
    },
    async restore(snapshot) {
      validateSession(snapshot);
      requireCondition(snapshot.publicationId === pkg.id && snapshot.engine === engine.id, 'PUBLICATION_MISMATCH', 'Cannot restore into a different publication');
      requireCondition(snapshot.pending === null && snapshot.state !== null, 'CHECKPOINT_PENDING', 'Export a settled checkpoint before transferring it');
      engine.validateState(pkg.content, snapshot.state, snapshot.status);
      requireCondition(!await repository.load(snapshot.id), 'SESSION_EXISTS', 'Restore requires an unused session ID');
      // Effect keys include the validated session and operation IDs. Persist
      // them first: a failed import can leave harmless orphans, not a usable
      // checkpoint whose external results are missing.
      for (const { key, ...effect } of snapshot.effects) {
        const stored = await repository.recordEffect(key, effect);
        requireCondition(canonical(stored) === canonical(effect), 'EFFECT_MISMATCH', 'Imported external result conflicts with an existing operation');
      }
      requireCondition(await repository.create(snapshot.id, snapshot), 'SESSION_EXISTS', 'Restore requires an unused session ID');
      return snapshot.id;
    },
    async close(id, expectedRevision) {
      const record = await read(id);
      if (record.value.status === 'closed') return copy(record.value);
      requireCondition(record.value.revision === expectedRevision && record.value.status !== 'completed', 'REVISION_CONFLICT', 'Reload before closing');
      const revision = record.value.revision + 1, at = clock();
      const next = { ...record.value, status: 'closed', pending: null, revision, updatedAt: at, events: [...record.value.events, { id: `${id}:${revision}:closed`, at, revision, type: 'session.closed', payload: {} }] };
      validateSession(next);
      requireCondition(await repository.commit(id, record.token, next), 'REVISION_CONFLICT', 'Another operation changed the session');
      return copy(next);
    }
  });
}
