# Mystery Prince

> A platform for continuously delivering and evolving interactive mystery experiences centered on attractive male characters.

This repository is the design source of truth for **MYSTERY PRINCE / ミステリープリンス**.

MYSTERY PRINCE is intentionally defined more broadly than its first implementation. It is not one fixed story, one fixed fictional universe, one fixed UI, or one fixed game format. The long-term platform should be able to absorb new interaction models and new AI capabilities without redefining the IP.

## Current platform thesis

The stable conceptual core is intentionally small:

- **PRINCE** — who is at the center of the attraction
- **MYSTERY** — what the user wants to know, solve, expose, or understand
- **EXPERIENCE** — how the user participates in that mystery

Current principles:

- **MYSTERY PRINCE is a platform, not a fixed game format.**
- **Prince is a broad brand label, not an in-world status.** A Prince does not need to be royalty and should not be over-defined.
- **PRINCE and ROLE are separate.** A recurring Prince may play different professions, eras, relationships, moral positions, or culprit/suspect/investigator roles across independent experiences.
- **Story continuity is optional, not a platform invariant.** The platform must not require one persistent fictional biography or universe.
- **Each mystery should work as a complete entertainment work first.** We do not mechanically assemble UI parts and call the result a mystery.
- **AI is initially an authoring/production tool, not a runtime dependency.** This may evolve later as economics, latency, quality, and capability improve.
- **Content meaning is independent of presentation UI.** Creation and Runtime are separated by an evolving Experience Contract.
- **Future extensibility should be preserved structurally, not by prematurely implementing speculative features.**

The desired posture is:

> **Broad platform definition, narrow initial implementation.**

## Working initial implementation

The first implementation may still be intentionally concrete, for example:

- Mobile-first
- Pre-authored / AI-assisted production-time content
- Independent, self-contained mystery experiences
- Multiple attractive male characters per experience
- Roughly 30-minute sessions as an initial working target
- Reusable high-quality character, background, evidence, sound, and presentation assets

These are **working implementation choices**, not permanent definitions of MYSTERY PRINCE.

Future EXPERIENCE types may include voice interaction, real-time AI characters, 3D investigation, multiplayer mystery, XR, or formats that do not yet exist.

## Working brand persona

**CROWN MASTER ZERO / クラウンマスター・ゼロ** is the current working designation for the IP-level host/persona associated with MYSTERY PRINCE. The role belongs to the brand layer, not to each mystery’s fictional continuity.

This is intentionally not yet treated as immutable naming.

## Architecture direction

The platform is currently separated conceptually into five layers:

1. **Brand** — MYSTERY PRINCE, PRINCE, CROWN MASTER ZERO, brand principles
2. **Content** — EXPERIENCE, MYSTERY, STORY, WORLD, ROLE, CAST
3. **Platform** — catalog, accounts, distribution, purchases, discovery, versioning
4. **Runtime** — current and future ways to play/present an EXPERIENCE
5. **Creation** — human/AI production, asset libraries, validation, authoring tools

Creation should output a stable **EXPERIENCE CONTRACT**. Runtime should interpret that contract without forcing current UI assumptions into the long-term content model.

A useful implementation mental model is becoming:

> **Whole Work Design → Experience Semantic Model → Validation → Realization Compilation → Runtime Playback**

AI models are replaceable tools around this pipeline rather than the identity of the platform.

## Documents

Start with the design index: [docs/README.md](docs/README.md)

Key documents:

1. [Current product thesis](docs/10-current-product-thesis.md)
2. [Platform core & Experience Contract](docs/09-platform-core-and-experience-contract.md)
3. [Durable domain model](docs/12-domain-model.md)
4. [Experience Core and contract boundary](docs/13-experience-core-and-contract.md)
5. [Authoring → Compiler → Runtime model](docs/14-authoring-compiler-runtime-model.md)
6. [PRINCE CORE minimum](docs/15-prince-core-minimum.md)
7. [MVP boundary and validation plan](docs/16-mvp-and-validation-plan.md)
8. [Vision and principles](docs/00-vision-and-principles.md)
9. [IP and brand model](docs/01-ip-and-brand-model.md)
10. [Prince / character model](docs/02-prince-character-model.md)
11. [Product and game model](docs/03-product-and-game-model.md)
12. [AI-assisted content production](docs/04-ai-content-production.md)
13. [Runtime and architecture direction](docs/05-runtime-and-architecture.md)
14. [Mystery data / semantic model](docs/06-mystery-data-model.md)
15. [Quality bar and risks](docs/07-quality-bar-and-risks.md)
16. [Open questions](docs/08-open-questions.md)
17. [Root design checklist](docs/11-root-design-checklist.md)
18. [Architecture decisions](docs/adr/README.md)

## Status vocabulary

- **DECIDED** — current design principle; change only deliberately.
- **WORKING** — current best direction, still expected to evolve.
- **OPEN** — intentionally unresolved.

## Current design objective

The root platform model is now sufficiently small to begin designing a first proof without treating the proof's UI or technology as permanent platform identity.

The next architectural milestone is to define a minimal schema/contract v0, then prove that two meaningfully different mystery works using recurring PRINCES can be authored as whole works, normalized into that contract, and realized by one simple Runtime v1 without custom engineering per work.
