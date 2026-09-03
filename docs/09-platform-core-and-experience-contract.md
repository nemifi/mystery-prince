# Platform Core & Experience Contract

## Status

Working architecture principle. This document captures the current platform-level direction before detailed MVP implementation.

## 1. Product identity

MYSTERY PRINCE is not defined as one specific game format. It is a platform for continuously adding and evolving interactive mystery experiences centered on attractive male characters.

The platform should remain valid even if the dominant interface, AI capability, content format, device, or runtime changes substantially over time.

The platform core is intentionally small:

- **PRINCE** — who is at the center of the attraction
- **MYSTERY** — what the user wants to know, solve, expose, or understand
- **EXPERIENCE** — how the user participates in that mystery

Everything else is considered replaceable or extensible implementation detail unless explicitly promoted to a platform invariant later.

## 2. Experience definition

An EXPERIENCE is any interactive content unit that satisfies three minimum conditions:

1. A PRINCE is present.
2. Some form of MYSTERY is present.
3. The user can participate in or influence the process of approaching the mystery.

An EXPERIENCE is not restricted to:

- 30-minute sessions
- visual novels
- 2D interfaces
- text input
- pre-authored stories
- single-player play
- runtime AI generation
- smartphones

Future examples may include short chat mysteries, voice interaction, 3D investigation, multiplayer mystery, live AI character performance, XR, or formats that do not yet exist.

## 3. Five-layer architecture

### Brand Layer
Long-lived IP concepts.

Examples:
- MYSTERY PRINCE
- PRINCE as a brand label
- CROWN MASTER ZERO
- brand principles

The Brand Layer must not depend on a specific AI model, UI framework, game engine, or interaction format.

### Content Layer
The work itself.

Examples:
- EXPERIENCE
- MYSTERY
- STORY
- WORLD
- ROLE
- CAST

Content should describe what the experience means, not how a particular screen renders it.

### Platform Layer
How content is distributed and managed.

Examples:
- accounts
- catalog
- delivery
- purchases
- versioning
- discovery
- search
- favorites
- future recommendation systems

The Platform Layer should not need to understand mystery logic in order to distribute an EXPERIENCE.

### Runtime Layer
How the EXPERIENCE is played or presented.

Examples:
- current mobile UI
- text ADV runtime
- evidence interaction
- voice runtime
- 3D runtime
- future real-time AI runtime

This is expected to change aggressively over time.

### Creation Layer
How EXPERIENCES are made.

Examples:
- human creators
- LLMs
- image generation
- mystery generators
- story tools
- asset libraries
- automated QA
- AI playtesting

Creation technology should be replaceable without redefining the product.

## 4. Experience Contract

The long-term architectural boundary should be an **EXPERIENCE CONTRACT** between Creation and Runtime.

Creation systems output an EXPERIENCE in a stable, runtime-independent representation.

Runtime systems consume that representation and decide how to present or operate it.

Conceptually:

```text
Creation Layer
     |
     v
EXPERIENCE CONTRACT
     |
     v
Runtime Layer
```

The contract should express meaning and required capabilities rather than current UI instructions.

Bad example:

```text
Show the SCAN button in the bottom-right corner.
```

Better example:

```text
This object can be inspected.
The inspection may reveal Fact X.
```

The current runtime may render that as a SCAN button. A future runtime might use natural-language conversation, voice, 3D manipulation, or another interaction model.

## 5. Capability-based runtime

An EXPERIENCE should declare what capabilities it requires or can optionally use.

Illustrative capabilities:

- CharacterInteraction
- Observation
- EvidenceHandling
- Deduction
- Navigation
- VoiceConversation
- VideoInspection
- 3DNavigation
- MultiplayerInteraction

A runtime advertises the capabilities it supports.

An EXPERIENCE can then be matched to a compatible runtime without assuming one permanent UI.

This allows the platform to evolve by adding capabilities rather than rewriting its identity.

## 6. Dependency principles

Current architectural rules:

1. **Brand must not depend on a specific technology.**
2. **Content must not depend on a specific runtime UI.**
3. **Content must not depend on whether it was authored by humans or AI.**
4. **Creation outputs the Experience Contract.**
5. **Runtime interprets the Experience Contract.**
6. **New AI capabilities and new UIs should be additive whenever possible.**
7. **Future extensibility should be preserved structurally, but future features should not be implemented prematurely.**

## 7. MVP implication

The initial product may still use a narrow, concrete implementation, such as a pre-authored mobile mystery experience.

That is acceptable.

The requirement is not that the MVP implement every future capability. The requirement is that the platform core does not confuse the MVP implementation with the permanent definition of MYSTERY PRINCE.

In short:

> Preserve future possibilities in the architecture. Do not pay for future features in the MVP.
