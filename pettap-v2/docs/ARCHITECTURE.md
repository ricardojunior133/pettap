# PetTap Application Architecture

## Purpose

The public product remains the Coming Soon website. The application routes are private foundations for the future NFC platform and are blocked in production by `proxy.ts`.

## Structure

- `app/`: route entry points and route-local layouts.
- `components/app/`: authenticated shell, navigation and empty data states.
- `components/ui/`: reusable primitives shared by product experiences.
- `types/platform.ts`: backend-neutral domain contracts.
- `schemas/platform.ts`: Zod validation contracts used by future forms and API boundaries.
- `features/`: future service-facing feature modules.
- `lib/`: presentation-independent utilities and integrations.
- `services/contracts.ts`: backend integration interfaces; no production mock adapter is selected.

## Routing and access

`/` remains public. The proxy allowlist contains only launch and legal routes; all application routes redirect to the public site while Coming Soon mode is active. Private routes can be developed locally without exposing unfinished functionality in production.

## Future integration

Authentication will resolve an `Owner` identity before rendering private data. A database repository will persist the domain entities in `types/platform.ts`. NFC scans will validate a tag server-side, apply visibility rules, and expose only the profile fields selected by the owner. Form submissions must validate against the Zod schemas at both the browser and server boundaries.
