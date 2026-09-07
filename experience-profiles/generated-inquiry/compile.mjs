import { copy } from '../../foundation/data.mjs';
import { requireCondition } from '../../foundation/errors.mjs';
import { validateContent } from '../../domains/inquiry/contracts.mjs';
import characterSchema from '../../domains/characters/definition.schema.json' with { type: 'json' };
import { validate } from '../../foundation/validation.mjs';

export function compileInquiry(source) {
  const content = { ...copy(source.design), title: source.intent.title };
  content.roles = content.roles.map(role => {
    const character = source.characters[role.characterId];
    requireCondition(character, 'DANGLING_REFERENCE', `No character ${role.characterId}`);
    validate(characterSchema, character);
    return { ...role, name: character.name };
  });
  validateContent(content);
  const requiredAssets = [content.backgroundAsset, ...content.roles.map(role => role.portraitAsset)];
  requiredAssets.forEach(id => requireCondition(Object.hasOwn(source.assets, id), 'ASSET_MISSING', `No source for ${id}`));
  return { content, requiredAssets, sourceMap: { definition: 'design.json', generation: 'case.generate/1' } };
}
