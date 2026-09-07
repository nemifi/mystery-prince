import { compileAuthored } from './authored-mystery/compile.mjs';
import { compileInquiry } from './generated-inquiry/compile.mjs';

export const profiles = new Map([
  ['authored-mystery/1', {
    engine: 'authored-engine', presenters: ['authored-presenter','authored-terminal'], permissions: [],
    async load({ local, global }, edition) {
      const [intent, roles, casting, rules, performance, assets] = await Promise.all(['intent.json','roles.json','casting.json','rules.json',edition.performance,'assets.json'].map(local));
      const characters = Object.fromEntries(await Promise.all([...new Set(casting.map(item => item.characterId))].map(async id => [id, await global(`domains/characters/assets/${id}.json`)])));
      return { intent, roles, casting, rules, performance, assets, characters, overlay: edition.overlay ? await global(edition.overlay) : null };
    },
    compile: compileAuthored
  }],
  ['generated-inquiry/1', {
    engine: 'inquiry-engine', presenters: ['inquiry-presenter','inquiry-terminal'], permissions: ['case.generate/1'],
    async load({ local, global }) {
      const [intent, design, assets] = await Promise.all(['intent.json','design.json','assets.json'].map(local));
      const characters = Object.fromEntries(await Promise.all([...new Set(design.roles.map(item => item.characterId))].map(async id => [id, await global(`domains/characters/assets/${id}.json`)])));
      return { intent, design, assets, characters };
    },
    compile: compileInquiry
  }]
]);
