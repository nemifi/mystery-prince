# Mystery Prince

> Character-first mystery entertainment IP + AI-assisted mystery game production system.

This repository is the design source of truth for **MYSTERY PRINCE / ミステリープリンス**.

The project is not defined as one fixed story or one fixed fictional universe. It is a long-running IP and product framework in which attractive male characters (“Princes”) can appear in many independent mystery works and roles, while the production system uses AI to help create a large supply of high-quality ~30-minute mystery games.

## Current core thesis

- **Prince is a brand label, not an in-world status.** A Prince does not need to be royalty and is not bound to one setting.
- **Character continuity lives in identity/personality, not biography.** A recurring Prince may play different roles, professions, eras, relationships, moral positions, or even culprit/suspect/investigator across independent works.
- **Each mystery should work as a complete work first.** We do not assemble stories mechanically from UI parts and call the result a mystery.
- **AI is initially an authoring/production tool, not a runtime dependency.** Mysteries are generated and refined before release; the user plays a packaged game without requiring per-play LLM API calls.
- **Game content is data; presentation is replaceable.** Mystery meaning/logic should not depend on today’s UI so the interface can evolve later without discarding the content library.
- **High-quality reusable assets are pre-produced.** Characters, backgrounds, props, evidence, music, effects, etc. are combined with generated story/game data.
- **The long-term technical asset may be an AI-assisted mystery game creation system; MYSTERY PRINCE is the first character-IP product built on top of it.**

## Working product shape

- Mobile app
- One play session: roughly **30 minutes**
- Independent, self-contained mysteries
- Multiple attractive male characters per work
- Strong mystery quality and character appeal must coexist
- Initially: AI-assisted creation at production time
- Later: runtime generation may be explored if economics, latency, quality and safety make sense

## Working brand persona

**CROWN MASTER ZERO / クラウンマスター・ゼロ** is the current working designation for the IP-level host/persona associated with MYSTERY PRINCE. The role belongs to the brand layer, not to each mystery’s fictional continuity.

This is intentionally not yet treated as immutable naming.

## Documents

1. [Vision and principles](docs/00-vision-and-principles.md)
2. [IP and brand model](docs/01-ip-and-brand-model.md)
3. [Prince / character model](docs/02-prince-character-model.md)
4. [Product and game model](docs/03-product-and-game-model.md)
5. [AI-assisted content production](docs/04-ai-content-production.md)
6. [Runtime and architecture direction](docs/05-runtime-and-architecture.md)
7. [Mystery data / semantic model](docs/06-mystery-data-model.md)
8. [Quality bar and risks](docs/07-quality-bar-and-risks.md)
9. [Open questions](docs/08-open-questions.md)
10. [Architecture decisions](docs/adr/README.md)

## Status vocabulary

- **DECIDED** — current design principle; change only deliberately.
- **WORKING** — current best direction, still expected to evolve.
- **OPEN** — intentionally unresolved.

## Near-term objective

Build the minimum production architecture that can prove this loop:

1. Define a strong complete mystery work.
2. Use AI to assist its design and production.
3. Map it into a reusable game representation.
4. Package it with prebuilt high-quality assets.
5. Play a polished ~30-minute mobile mystery.
6. Add another mystery without custom engineering for that specific work.
