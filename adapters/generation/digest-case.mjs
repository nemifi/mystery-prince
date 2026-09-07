import { digest } from '../../foundation/data.mjs';

// Independent replacement provider: a digest selects both ownership and truth.
export const digestCaseProvider = {
  id: 'digest-case-generator/1', idempotent: true,
  async invoke({ seed, roles, tokens }) {
    const hash = await digest({ seed, roleIds: roles.map(role => role.id) });
    const selected = parseInt(hash.slice(0, 6), 16) % roles.length;
    const offset = parseInt(hash.slice(6, 12), 16) % roles.length;
    const keys = roles.map((role, index) => ({ roleId: role.id, token: tokens[(roles.length - index + offset) % roles.length] }));
    return { schema: 'inquiry-instance/1', culpritRoleId: roles[selected].id, allegationRoleId: roles[(selected + roles.length - 1) % roles.length].id, accessToken: keys[selected].token, keys };
  }
};
