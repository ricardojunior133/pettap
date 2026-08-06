# Backend

## Summary

PetTap's private platform uses Supabase Auth, PostgreSQL through Drizzle ORM, and server-only Repository → Service → Server Action boundaries. React UI does not query Supabase or PostgreSQL directly.

## Implemented private domains

- Accounts and profiles are bootstrapped from the authenticated Supabase user.
- Pets are read and mutated only with an authenticated account ID.
- Photos use a private Storage-oriented service boundary.
- Medical information is encrypted before persistence.
- Vaccinations and emergency contacts are scoped to an owned pet.
- NFC tag activation is private and account-scoped.
- Lost Mode stores an active or resolved record and has an idempotent resolution outcome.
- Notification preferences are private account settings.

## Current limitations

- RLS has not yet been applied; app-layer ownership must remain in place.
- Storage buckets and policies still require production verification.
- NFC activation must not use a public tag ID as its final secret activation code.
- Public rescue, finder reporting and notifications remain gated by Coming Soon.
- Commerce, orders, payments, fulfilment, refunds and administration require a schema and permission sprint.

## Operational rule

No database schema or migration changes are part of Sprint 13A. The next backend security milestone is RLS and account isolation.
