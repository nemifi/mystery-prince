// A local, bounded case generator, not a pretend LLM. Its public capability is
// also implementable by a remote provider that honors the same operation keys.
export const seededCaseProvider = {
  id: 'local-case-generator/1', idempotent: true,
  async invoke({ seed, roles, tokens }) {
    let number = 2166136261;
    for (const char of seed) number = Math.imul(number ^ char.codePointAt(0), 16777619) >>> 0;
    const culpritIndex = number % roles.length;
    const offset = (number >>> 8) % roles.length;
    const keys = roles.map((role, index) => ({ roleId: role.id, token: tokens[(index + offset) % roles.length] }));
    return { schema: 'inquiry-instance/1', culpritRoleId: roles[culpritIndex].id, allegationRoleId: roles[(culpritIndex + 1) % roles.length].id, accessToken: keys[culpritIndex].token, keys };
  }
};
