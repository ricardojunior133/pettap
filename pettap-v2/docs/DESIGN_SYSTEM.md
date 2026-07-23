# Design System

Use existing primitives in `components/ui` before creating new ones. Buttons and inputs include keyboard focus states; Cards provide the neutral elevated surface; Badge communicates compact status; Dialog and Sheet own focus management. Private application pages use `AppShell`, `PageHeader` and `EmptyState` for consistent spacing and honest no-data states.

Tokens are maintained in `app/globals.css` and `lib/theme.ts`. New components must use semantic colour tokens, existing radius values and reduced-motion-safe transitions instead of one-off visual values.
