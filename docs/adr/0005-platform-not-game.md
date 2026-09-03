# ADR 0005: MYSTERY PRINCE is a platform, not a fixed game format

## Status
Accepted

## Decision
MYSTERY PRINCE is defined at the top level as a platform for interactive mystery experiences centered on PRINCE characters, not as a specific 30-minute mobile game, visual novel, chat game, AI-generated game, or other fixed format.

The permanent core is intentionally limited to:

- PRINCE
- MYSTERY
- EXPERIENCE

UI, game format, runtime AI, creation AI, session length, device, and presentation technology remain replaceable or extensible.

## Rationale
AI and interaction technology are expected to evolve rapidly. Binding the product identity to today's implementation would unnecessarily constrain future experience formats and force later architectural rewrites.

The MVP may be narrow. The platform definition should not be.
