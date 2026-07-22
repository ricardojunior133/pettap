# PetTap Documentation

## Summary

PetTap is a premium NFC pet-tag platform designed to help people reconnect lost pets with their families. This documentation is the shared reference for developers, product collaborators, and AI assistants working on the project.

It describes the product as it exists in this repository today. Planned capabilities are explicitly identified as future work and must not be treated as shipped functionality.

## Documentation Index

- [00 — Vision](./00-vision.md): product purpose, customer problem, values, and positioning.
- [01 — Brand](./01-brand.md): name, visual language, voice, and NFC-only rules.

## What PetTap Is

PetTap combines a personalised physical NFC pet tag with a mobile-first public rescue profile. A person can tap a compatible smartphone against the tag to open the pet’s recovery information and contact the owner without installing an app.

The current application also includes a premium product configurator and mock owner-management experiences. It is a product foundation, not yet a production account, commerce, or data platform.

## Product Goal

Make the important moment feel simple: when someone finds a pet, they should understand what to do and reach the owner quickly. Every touchpoint should feel calm, trustworthy, and considered.

## Audience

- Pet owners who value a more thoughtful, durable alternative to a traditional engraved tag.
- People who find a pet and need clear, immediate contact options.
- Future PetTap operators and collaborators responsible for product, design, and engineering.

## Current Product Modules

| Module | Purpose | Current state |
| --- | --- | --- |
| Landing | Explains the product, NFC interaction, finishes, delivery presentation, and common purchase questions. | Implemented |
| Studio | Lets a customer personalise a PetTap visually, including shape, finish, engraving, size, collection, and live summary. | Implemented as a front-end configurator |
| Rescue | Public, mobile-first profile opened from a PetTap tag. | Implemented with mock profiles and normal/lost presentation states |
| Owner Dashboard | Private-style owner overview for pets, tags, and activity. | Implemented with mock data only |
| Pet Workspace | Dedicated overview for an individual pet. | Implemented with mock data; future tabs are placeholders |

## Architecture Overview

PetTap uses the Next.js App Router. Routes are thin server components that compose feature components and obtain data from local domain or mock modules.

```text
app/                         Route entry points
components/                  Reusable feature and UI components
  landing/                   Marketing experience
  studio/                    Personalisation experience
  rescue/                    Public rescue experience
  dashboard/                 Owner dashboard and pet workspace experience
  ui/                        Shared design-system primitives
lib/                         Shared product configuration and dashboard mock domain
src/lib/domain/              Rescue and tag-oriented domain data
public/                      Local visual assets
docs/                        Product and project documentation
```

### Routes Available Today

| Route | Purpose |
| --- | --- |
| `/` | Marketing landing page |
| `/studio` | Product personalisation Studio |
| `/pet/[tagId]` | Public rescue profile for a known mock tag |
| `/dashboard` | Owner dashboard foundation |
| `/dashboard/pets/[petId]` | Individual pet workspace foundation |

The legacy `/pets/[slug]` route redirects to a public PetTap profile for compatibility.

## Technology Stack

- Next.js 16 with the App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Framer Motion for focused micro-interactions
- Lucide React for interface icons
- Base UI and local shared UI primitives

No backend, authentication provider, database, payment integration, or API layer is implemented in the current repository.

## Running the Project

### Prerequisites

- Node.js compatible with the project dependencies
- npm

### Install and start

```bash
npm install
npm run dev
```

Open `http://localhost:3000` in a browser.

### Quality checks

```bash
npm run build
npx tsc --noEmit
npm run lint
```

The build command also performs a TypeScript check. Keep the project compiling before handing work over.

## Working Principles

- Preserve the existing architecture and reuse existing components before creating new ones.
- Keep static and server-rendered UI on the server; isolate client code to interactions that need browser APIs or state.
- Treat the Studio preview and public rescue actions as high-value product moments.
- Prefer clarity, restraint, accessibility, and perceived product value over feature volume.
- Do not introduce fictional flows, routes, or integrations.
- Maintain strict TypeScript and avoid suppressing errors.

## Notes

- Current owner, pet, activity, and rescue information is mock data.
- Public rescue routes are deliberately marked `noindex`.
- Documentation belongs in this folder; update it when a feature or a meaningful product decision changes.
- Finishes are defined once in `lib/finishes.ts`. They represent plausible matte PETG colours; avoid digital-only effects or misleading metal-material claims.

## Future Roadmap

The present architecture is prepared to grow into real owner accounts, multiple pet management, tag activation, editable profiles, health records, emergency contacts, Lost Mode controls, notifications, and order-related capabilities. These features are not implemented yet.
