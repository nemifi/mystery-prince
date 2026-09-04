# Domain Model

Status: WORKING

## Purpose

Keep MYSTERY PRINCE small at the core and extensible at the edges. The durable model should survive changes in AI, UI, runtime technology, business model, and content format.

## First-class durable objects

### PRINCE
A durable IP identity. PRINCE is intentionally broad and is not defined by an in-world status, job, age, morality, species, or biography.

A PRINCE may be represented differently over time, but keeps the same stable identity.

### EXPERIENCE
A durable work identity: one mystery experience as a semantic work, independent of the specific runtime used to present it.

### CASTING
A many-to-many relation between PRINCE and EXPERIENCE.

CASTING owns work-specific identity such as role, occupation, age-in-work, relationships, moral position, narrative function, and other fictional biography for that experience.

### REALIZATION
A concrete playable implementation of an EXPERIENCE for a specific runtime/capability set.

Examples: 2D mobile edition, voiced edition, future free-conversation edition, future 3D edition.

### SESSION
One play instance of one REALIZATION. SESSION is runtime state and does not define the identity of the PRINCE or EXPERIENCE.

## Graph

PRINCE <-> CASTING <-> EXPERIENCE -> REALIZATION -> SESSION

## Important non-objects at the initial stage

WORLD, MYSTERY TYPE, COLLECTION, USER RELATIONSHIP, LONG-TERM MEMORY, and similar concepts should not become first-class domain objects until a concrete requirement proves they need their own durable identity.

Rule: do not promote a concept into the core model merely because it may be useful later.

## Identity rule

Representation may change; identity should not.

A PRINCE can move from 2D art to 3D or AI performance without becoming a new PRINCE. An EXPERIENCE can receive a new REALIZATION without becoming a new EXPERIENCE, as long as its work identity remains the same.
