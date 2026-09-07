export class ContractError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = 'ContractError';
    this.code = code;
    this.details = details;
  }
}

export function requireCondition(condition, code, message, details) {
  if (!condition) throw new ContractError(code, message, details);
}

export function diagnostic(error) {
  return { code: error.code || 'INTERNAL_ERROR', message: error.message, details: error.details || {} };
}
