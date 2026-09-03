# ADR 0006: Use an Experience Contract between creation and runtime

## Status
Accepted

## Decision
Creation systems and runtime systems are separated by a stable EXPERIENCE CONTRACT.

Creation systems describe the semantics of an EXPERIENCE: characters, roles, mystery state, information, relationships, interaction opportunities, progression requirements, and required capabilities.

Runtime systems decide how those semantics are presented and operated on current devices and interfaces.

The content model must not encode permanent assumptions such as button positions, dialogue-box layouts, 2D scene structure, or a specific AI interaction model.

## Rationale
This boundary allows future UI, voice, 3D, XR, multiplayer, or real-time AI runtimes to evolve without invalidating the long-term content model. It also allows human-authored and AI-authored content to target the same platform contract.
