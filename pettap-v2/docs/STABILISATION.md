# Sprint 13A Stabilisation

## Build reliability

The root layout uses the system font stack defined in `app/globals.css`. The previous `next/font/google` import was removed because production builds must not download Inter from Google. The expected visual result remains a modern native sans-serif stack: Inter when installed locally, then system UI fonts.

## Server Actions

Redirecting actions validate, authenticate, authorize, mutate and revalidate inside their error boundary. `redirect()` is deliberately called after the boundary because Next.js implements redirects as control-flow errors.

## Lost Mode

Resolving Lost Mode returns an explicit, accessible action state. A successful resolution is idempotent; repeated submissions receive an already-resolved message rather than silently failing. Ownership remains enforced through the existing authorized-pet service.

## Asset policy

The public hero and narrative imagery have WebP production variants. Transparent PetTag PNGs are retained because the product selector needs alpha transparency. Original PNG source assets remain in the repository for future art-direction updates and are not referenced by the application.

## Remaining platform limitations

| Area | Status |
| --- | --- |
| Database RLS | Pending — next security sprint. |
| Supabase Storage buckets/policies | Requires production verification. |
| NFC activation secret codes | Pending — public IDs must not be final activation secrets. |
| Commerce schema and Stripe | Not implemented. |
| Roles and administration | Not implemented. |
| End-to-end browser coverage | Recommended before opening private routes. |
