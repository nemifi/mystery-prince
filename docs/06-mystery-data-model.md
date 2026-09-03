# 06 — Mystery Data / Semantic Model

This document is intentionally conceptual. It should not yet be treated as a final schema.

## Goal

Represent a mystery independently of the exact UI that happens to exist today.

## Conceptual layers

### TRUTH
What actually happened in the fictional work.

Examples:
- culprit
- motive
- method
- timeline
- location states
- actions taken by each person

### KNOWLEDGE
Who knows, believes, misremembers or lies about what.

This is important because character testimony must be constrained by what the character could actually know.

### ENTITIES
Things that can participate in the work:
- characters
- objects/evidence
- locations
- events
- statements
- documents/media
- hypotheses

### FACTS
Atomic propositions that may be true, false, hidden or discovered.

### RELATIONS
Meaningful relationships among entities/facts, such as:
- contradiction
- support
- ownership
- presence
- causality
- temporal order
- access/opportunity

### PLAYER KNOWLEDGE STATE
What the player currently has access to or has established.

### DISCOVERY / PROGRESSION
How the player can move from initial information toward the truth.

This may be graph-like rather than purely linear.

### DRAMATIC BEATS
Narrative pacing/meaning should be represented separately from pure solvability.

Examples:
- initial hook
- first suspicion
- plausible false theory
- reversal
- breakthrough
- confrontation
- resolution

## Important principle

### DECIDED
Logical structure and dramatic structure are separate concerns that must cooperate.

A solvable graph is not automatically a good story.
A good synopsis is not automatically a fair mystery game.

Both layers are required.

## Presentation mapping

The presentation layer maps semantic opportunities to currently available UI capabilities.

The semantic model should avoid embedding screen coordinates or one-off story UI wherever possible.
