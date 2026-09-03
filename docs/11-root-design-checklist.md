# Root Design Checklist

Use this checklist before accepting major product or architecture decisions.

## Platform identity

- Does this decision keep MYSTERY PRINCE understandable as a platform rather than one fixed game format?
- Does it preserve PRINCE + MYSTERY + EXPERIENCE as the stable conceptual core?
- Is a temporary implementation detail being mistaken for a permanent product definition?

## Extensibility

- Could a future voice, 3D, XR, multiplayer, or real-time AI runtime coexist with this design?
- Can a new capability be added without rewriting existing content semantics?
- Are we preserving options structurally rather than building speculative features now?

## Content freedom

- Does this unnecessarily constrain PRINCE definitions?
- Does this force persistent story continuity where none is needed?
- Can the same PRINCE still take radically different ROLEs in different EXPERIENCES?

## Architecture boundaries

- Does Brand depend on runtime technology? It should not.
- Does Content encode current UI details? It should not.
- Does Content care whether it was made by a human or AI? It should not.
- Can Creation output a stable Experience Contract?
- Can Runtime interpret that contract independently?

## MVP discipline

- Is this necessary to validate an initial user value hypothesis?
- If not, can it remain an extension point rather than an implemented feature?
- Are we solving a real initial problem or anticipating an uncertain future one?

## Quality

- Does this improve the actual entertainment value of the mystery experience?
- Does it preserve character appeal without reducing mystery to a promotional wrapper?
- Are we optimizing for platform possibility at the expense of an enjoyable first product?

The desired posture is:

> **Broad platform definition, narrow initial implementation.**
