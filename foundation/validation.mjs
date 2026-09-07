import Ajv from 'ajv/dist/2020.js';
import { ContractError } from './errors.mjs';

const ajv = new Ajv({ allErrors: true, strict: true, allowUnionTypes: true });
const validators = new WeakMap();
export function validate(schema, value, label = schema.$id || 'data') {
  if (!validators.has(schema)) validators.set(schema, ajv.compile(schema));
  const check = validators.get(schema);
  if (!check(value)) throw new ContractError('SCHEMA_INVALID', `${label} does not satisfy its contract`, {
    errors: check.errors.map(({ instancePath, keyword, message, params }) => ({ instancePath, keyword, message, params }))
  });
  return value;
}
