# PetTap Architecture

## Summary

PetTap uses a pragmatic domain-driven architecture on top of the Next.js App Router. The goal is to give product domains clear ownership without disrupting stable user experiences or forcing a premature backend design.

This document describes the architecture implemented today. It intentionally distinguishes current boundaries from future infrastructure.

## Objective

Keep the platform safe to evolve as it grows from local mock data into a production product. New work should have a domain home before its components, mock data, or services are created.

## Current Structure

```text
app/                         Next.js routes, metadata, loading and error boundaries
components/                  Existing visual feature components and shared UI
  ui/                        Reusable interface primitives
  layout/                    Global navigation and layout elements
features/                    Public domain APIs and integration boundaries
  owner/                     Owner-oriented read API
  pet/                       Pet Workspace read API
  tag/                       Physical-tag product API
  rescue/                    Public rescue read API
  experience/                Re-exports for reusable experience animations
types/                       Canonical domain contracts
lib/ and src/lib/domain/     Existing mock data and product helpers, retained as adapters
docs/                        Product and engineering references
```

`app/` remains at the repository root because it is the active Next.js App Router. It must not be moved into `src/` during this migration.

## Domains

### Owner

Owns the person responsible for a pet and owner-facing summary information. The current public API is `@/features/owner`.

### Pet

Owns pet identity, profile information, and the Pet Workspace boundary. A pet may reference a tag by ID, but it does not own NFC behaviour. The current public API is `@/features/pet`.

### Tag

Owns the physical PetTap, product configuration, activation code, lifecycle state, and NFC-related behaviour. The current public API is `@/features/tag`.

### Rescue

Owns public rescue profiles, Lost Mode, emergency states, rescue timelines, and recovery-facing actions. The current public API is `@/features/rescue`.

### Account and Notifications

Canonical contracts exist in `types/account.ts` and `types/notification.ts`. No feature folders are created yet because the application does not implement account infrastructure or notifications.

### Experience

Owns cross-domain emotional and behavioural elements such as feedback, loading, empty states, onboarding, and restrained animation. Only existing animation exports are exposed today; no new experience behaviours were added during the architecture Sprint.

## Dependency Rules

1. `app/` imports domain public APIs from `features/`.
2. Domains may import canonical contracts from `types/`.
3. Domains may use shared interface primitives from `components/ui` and global structure from `components/layout`.
4. Shared UI and layout components must not import product-domain components.
5. Domain-to-domain integration happens through IDs, props, canonical types, or a domain public API—not through deep implementation imports.
6. Internal source files should not import their own barrel when that could introduce a cycle.

## Types

Canonical contracts live in `types/`:

- `owner.ts`
- `pet.ts`
- `tag.ts`
- `rescue.ts`
- `account.ts`
- `notification.ts`

Legacy type paths in `src/lib/domain/tag/types.ts` and `src/lib/domain/rescue/types.ts` re-export canonical contracts for compatibility. New domain contracts belong in `types/`; legacy paths should not become a second source of truth.

## Mocks and Services

The project currently uses local mocks only. Existing mock collections remain in their original locations to avoid changing UI behaviour during this incremental migration.

Feature services are small read adapters over those mocks:

- `features/owner/services/ownerService.ts`
- `features/pet/services/petService.ts`
- `features/tag/services/tagService.ts`
- `features/rescue/services/rescueService.ts`

When a backend is introduced, replace the adapter implementation behind the same public API before changing screens. Do not add network calls, database access, server actions, or persistence to this architecture layer today.

## IDs

Current UI routes use stable human-readable slugs such as `charlie` and `luna`, while public tag routes use stable tag identifiers such as `7F4K92X`. These route identifiers are preserved for compatibility.

New persistent domain records must use stable prefixed identifiers:

```text
owner_000001
pet_000001
tag_000001
rescue_000001
notification_000001
```

Never generate record identities with `Math.random()`, `Date.now()`, or array indexes.

## Components

`components/ui` and `components/layout` are global by design and remain where they are. Existing feature components also remain at their stable paths during this foundation Sprint; moving all visual files would add import churn without improving the domain APIs already used by routes.

New feature-specific components should be placed beneath their feature domain once that component is not required by multiple domains. Do not put a clearly owned Pet, Tag, or Rescue component into a generic shared folder.

## Hooks

Create a hook only when an interactive client component has a real repeated need. Server routes and components should continue receiving data by props or feature services. Do not add `"use client"` merely to consume mock data.

## Import Convention

Prefer public aliases:

```ts
import { getPetWorkspaceById } from "@/features/pet";
import type { Pet } from "@/types/pet";
import Card from "@/components/ui/Card";
```

Avoid deep imports into another feature’s internal folders and long relative paths.

## Adding a Feature

1. Assign the capability to a domain before writing UI.
2. Add or reuse a canonical type in `types/`.
3. Put mock data behind that domain’s public API when needed.
4. Keep routes thin: they compose components and request data from a feature API.
5. Keep browser state isolated to the smallest client component that needs it.
6. Update this document if a new domain boundary or dependency rule is introduced.

## Choosing a Domain

| Concern | Domain |
| --- | --- |
| Owner details, family, preferences | Owner |
| Pet profile, health and identity | Pet |
| NFC, activation, configuration and replacement | Tag |
| Lost Mode, public rescue and recovery activity | Rescue |
| Theme, locale, security and billing | Account |
| Alerts, delivery channels and notification preferences | Notifications |
| Cross-domain feedback, empty states and onboarding | Experience |

## Conceptual Relationship

```text
Owner ── owns ──> Pet ── references ──> Tag
                         │
                         └── may have ──> Rescue state
```

**Pet does not own NFC logic. Tag owns NFC-related state.** Rescue coordinates recovery state through pet and tag identifiers without taking ownership of the tag’s technical configuration.

## Notes

- This is a DDD Lite foundation, not a backend architecture.
- No account, notification, database, authentication, payment, or external API functionality is implemented.
- Existing component paths and mock locations are compatibility adapters that can be migrated domain by domain when a feature requires it.

## Future Roadmap

Future work may move mock collections behind feature-local `mocks/` folders, add feature-specific components and hooks as real use cases appear, and replace mock service adapters with persistent implementations. These changes should preserve the public APIs established in `features/`.
