import { copy, unique } from '../../foundation/data.mjs';
import { requireCondition } from '../../foundation/errors.mjs';
import { validate } from '../../foundation/validation.mjs';
import characterSchema from '../../domains/characters/definition.schema.json' with { type: 'json' };
import { validateContent } from '../../domains/mystery/contracts.mjs';
import { bindText } from '../../domains/characters/bind-text.mjs';

export function compileAuthored(source) {
  const { intent, roles, casting, rules, characters } = source;
  const performance = copy(source.performance);
  unique(roles.map(role => role.id), 'role definition');
  unique(casting.map(item => item.roleId), 'casting');
  requireCondition(casting.length === roles.length, 'CASTING_INCOMPLETE', 'Each role needs one casting');
  for (const patch of source.overlay?.patches || []) {
    const cue = performance.cues[patch.cueId];
    requireCondition(cue && typeof cue[patch.field] === 'string' && cue[patch.field] === patch.before && ['text','title','quote','eyebrow','cta'].includes(patch.field), 'OVERLAY_CONFLICT', `Overlay no longer matches ${patch.cueId}.${patch.field}`);
    cue[patch.field] = patch.after;
  }
  const cast = roles.map(role => {
    const assignment = casting.find(item => item.roleId === role.id);
    requireCondition(assignment, 'CASTING_INCOMPLETE', `No casting for ${role.id}`);
    const character = characters[assignment.characterId];
    requireCondition(character, 'DANGLING_REFERENCE', `Unknown character ${assignment.characterId}`);
    validate(characterSchema, character);
    return { id: role.id, label: role.label, characterId: character.id, name: character.name, portraitAsset: assignment.portraitAsset };
  });
  const content = { schema: 'authored-mystery/1', title: intent.title, premise: intent.summary, roles: cast, rules: copy(rules), performance: bindText(performance, cast) };
  validateContent(content);
  const requiredAssets = [performance.backgroundAsset, ...cast.map(role => role.portraitAsset)];
  requiredAssets.forEach(id => requireCondition(Object.hasOwn(source.assets, id), 'ASSET_MISSING', `No source for asset ${id}`));
  return { content, requiredAssets, sourceMap: Object.fromEntries(Object.keys(rules.nodes).map(id => [id, { rule: `rules.json#/nodes/${id}`, performance: `performances/ja.json#/cues/${rules.nodes[id].cueId}` }])) };
}
