# 05 — Runtime and Architecture Direction

## Architectural objective

Build a runtime that can play many mystery works from structured data while allowing the UI/interaction layer to evolve over time.

## Three-layer separation

### 1. Mystery semantics / content data
Describes what exists and what is true in the work.

### 2. Game/interaction logic
Describes what the player can discover, infer, challenge or decide and how state changes.

### 3. Presentation renderer
Describes how today’s client shows and receives those interactions.

### DECIDED
The mystery content should not need to know whether a contradiction is expressed via:
- tapping two cards
- dragging evidence onto dialogue
- natural-language text
- voice interrogation
- a future 3D interface

## Mystery Device

### WORKING
A **Mystery Device / Mystery OS** can be the consumer-facing embodiment of the interaction layer.

Important: the architectural value is capability abstraction, not the fiction of a literal device.

## Capability model

### WORKING
The runtime will eventually expose reusable capabilities rather than story-specific mini-games.

Example categories:
- observe/investigate
- communicate/ask
- inspect/analyze
- compare/verify
- connect/relate
- reconstruct/order
- challenge/confront
- hypothesize/deduce
- decide/accuse

Names and exact boundaries are open.

## Adding future UI

A future client may implement the same semantic interaction differently.

Example:

Content semantics:
> Statement S and Evidence E contradict each other.

Possible renderer v1:
> choose S, choose E, tap “challenge.”

Possible renderer v2:
> drag E onto the spoken line.

Possible renderer v3:
> say “But you appear on the camera at 22:18.”

The mystery asset remains useful.

## Adding future capabilities

New product versions may add a reusable capability such as video inspection, voice analysis or spatial reconstruction.

Once implemented once in the runtime, future AI-assisted productions can use it repeatedly.

This creates the desired leverage:

> one platform feature → many future mysteries

## AI-assisted software development

The application itself may be developed heavily with coding agents/AI, but the architecture should remain conventional and testable:
- typed schemas
- deterministic state transitions where possible
- validation
- fixtures
- automated tests
- clear versioning

“AI-developed” should not mean “unstructured runtime behavior.”
