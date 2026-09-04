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

The platform is conceptually separated into five layers:

1. **Brand** — MYSTERY PRINCE, PRINCE, CROWN MASTER ZERO, brand principles
2. **Content** — EXPERIENCE, MYSTERY, STORY, WORLD, ROLE, CAST
3. **Platform** — catalog, accounts, distribution, purchases, discovery, versioning
4. **Runtime** — current and future ways to play/present an EXPERIENCE
5. **Creation** — human/AI production, asset libraries, validation, authoring tools

Creation outputs an **EXPERIENCE CONTRACT**. Runtime interprets that contract without forcing current UI assumptions into the long-term content model.

The implementation mental model is:

> **Whole Work Design → Experience Semantic Model → Validation → Realization Compilation → Runtime Playback**

AI models are replaceable tools around this pipeline rather than the identity of the platform.

## Architecture proof: passing

The first end-to-end architecture proof now exists and is exercised by CI:

- Experience Contract JSON Schema v0.1
- PRINCE CORE JSON Schema v0.1
- three prototype PRINCE Cores
- two deliberately different MASTER WORKS using the same recurring PRINCES
- two machine-readable Experience Contract fixtures
- static semantic/reference/reachability validation
- deterministic Experience → Realization-v1 compiler
- disposable Runtime-v1 contract harness
- automatic completion of both generated Realizations through the same runtime code path

The fixture work also already forced one useful schema correction: completion must represent an explicit successful player decision rather than treating discovery of truth as equivalent to acting on it.

This is the intended development pattern: concrete works stress the abstraction, and the abstraction evolves only when real works expose a need.

## What this does not prove

The current Runtime is intentionally not the commercial MYSTERY PRINCE game UI.

The remaining highest-risk questions are product questions:

- Does a recurring PRINCE remain attractive and recognizable across radically different ROLEs and biographies?
- Does character attachment make the mystery stronger rather than distracting from it?
- Does the user want to see the same PRINCES cast again in new works?

Until those are tested, final interaction design, retention systems, monetization architecture, and large-scale AI content production remain secondary.

## Documents

Start with the design index: [docs/README.md](docs/README.md)

Current prototype path:

1. [Current product thesis](docs/10-current-product-thesis.md)
2. [Platform core & Experience Contract](docs/09-platform-core-and-experience-contract.md)
3. [Domain model](docs/12-domain-model.md)
4. [Experience Core](docs/13-experience-core-and-contract.md)
5. [Authoring → Compiler → Runtime](docs/14-authoring-compiler-runtime-model.md)
6. [PRINCE CORE minimum](docs/15-prince-core-minimum.md)
7. [MVP / validation plan](docs/16-mvp-and-validation-plan.md)
8. [Experience Contract Schema v0](docs/17-experience-contract-schema-v0.md)
9. [Prototype PRINCES](docs/18-concept-prototype-princes.md)
10. [MASTER WORK A](docs/19-master-work-a.md)
11. [MASTER WORK B](docs/20-master-work-b.md)
12. [Runtime v1 contract harness](docs/21-runtime-v1-contract-test-harness.md)
13. [Build sequence](docs/22-build-sequence.md)
14. [Realization v1](docs/23-realization-v1-format.md)
15. [Concept-test protocol](docs/24-concept-test-protocol.md)
16. [Architecture decisions](docs/adr/README.md)

## Status vocabulary

- **DECIDED** — current design principle; change only deliberately.
- **WORKING** — current best direction, still expected to evolve.
- **OPEN** — intentionally unresolved.

## Immediate objective

The architecture proof has passed. The immediate next milestone is **H1/H2 creative validation**: make the two prototype slices polished enough for target users to judge the star-system and character × mystery experience rather than the roughness of the prototype.
