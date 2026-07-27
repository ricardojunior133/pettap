# Sprint 25B — Controlled Customer Portal Import Report

## Result

Sprint 25B delivered a small, versioned and authenticated Customer Portal
foundation without importing the unversioned Commerce, pet, tag, medical, photo,
notification or Lost Mode code from the original workspace.

The portal is intentionally **partial**: profile and account identity are real;
order history is an explicit safe-unavailable state because the Commerce schema and
migrations are not part of the published baseline. No order data is mocked,
queried, or exposed.

## Imported, reconstructed and discarded files

### Reconstructed against the published baseline

| File | Purpose |
| --- | --- |
| `app/account/layout.tsx` | Server-side session guard, private/noindex account metadata and account shell. |
| `app/account/page.tsx` | Premium overview using a safe server-side profile DTO. |
| `app/account/profile/page.tsx` | Read-only, authenticated profile presentation. |
| `components/account/AccountShell.tsx` | Responsive navigation and existing server-side logout action. |
| `features/account/repositories/account-profile-repository.ts` | Account-scoped query of the baseline `profiles` table. |
| `features/account/services/account-portal-service.ts` | Server-side profile/overview service and safe view models. |
| `app/account/orders/page.tsx` | Explicit unavailable state until compatible Commerce is versioned. |
| `app/account/orders/[orderNumber]/page.tsx` | Explicit unavailable detail state; never attempts an unowned lookup. |
| `tests/account-portal.test.ts` | Authentication and safe-DTO service tests. |

### Merged baseline file

| File | Change |
| --- | --- |
| `proxy.ts` | Adds only an `/account/**` session-protected route branch with `private, no-store` and `noindex, nofollow`. Existing Coming Soon, Event Demo and admin branches remain intact. |
| `vitest.config.ts` | Broadens the local test include from Event Demo-only files to all `tests/**/*.test.ts`, preserving Event Demo coverage and including account tests. |

### Explicitly discarded/deferred

- `features/commerce/**`, `db/schema/commerce.ts` and unversioned Commerce
  migrations: absent from the published schema/migration baseline.
- Legacy `/dashboard/**` and dashboard mock/UI trees: duplicate namespace and
  experimental coupling.
- Pets, tags, medical, contacts, photos, notifications and Lost Mode: require
  unversioned schemas/repositories and were not imported.
- Customer profile editing: source requires fields not declared by baseline
  `profiles`; the delivered profile is read-only.

## Security decisions

- The account layout and proxy derive authentication exclusively from the existing
  server-side Supabase session helper.
- The repository accepts an account ID only from `AccountPortalService`, which
  obtains it from the authenticated user; no browser account ID is used.
- The profile DTO exposes only display name, the authenticated user's email and
  phone. It does not expose account IDs, profile IDs, audit data or database rows.
- Order routes make no database query until a versioned account-scoped order
  repository and Commerce schema exist. This prevents accidental cross-account
  access and avoids claiming ownership validation that cannot yet be performed.
- `/account/**` responses are private/no-store and noindex/nofollow.

## Routes delivered

| Route | State |
| --- | --- |
| `/account` | Authenticated overview with real profile identity. |
| `/account/profile` | Authenticated read-only profile data. |
| `/account/orders` | Authenticated safe-unavailable order state. |
| `/account/orders/[orderNumber]` | Authenticated safe-unavailable order-detail state. |

Unauthenticated access is redirected to `/login` by the proxy and independently
guarded by the account layout.

## Tests

Added service tests prove that:

- unauthenticated access is rejected before the profile repository is queried;
- the DTO contains no account identifier;
- display-name fallback uses only the authenticated user's own metadata;
- overview declares order history unavailable rather than producing mock data.

The full suite now contains 8 test files and 40 passing tests.

## Quality gates

Executed in `C:\Users\ricar\premium-account-portal\pettap-v2\pettap-v2`:

| Command | Result |
| --- | --- |
| `npm run lint` | PASS |
| `npm test` | PASS — 8 files, 40 tests |
| `npm run typecheck` | PASS |
| `npm run build` | PASS |

## Commits

1. `34376d7` — `docs(account): document controlled portal import`
2. `06b4cc3` — `feat(account): add premium account portal foundation`
3. `11c2b64` — `feat(account): add safe order history states`
4. `b2c9a0f` — `test(account): cover portal authentication and safe DTOs`

## Pending Sprint 25C

1. Version and review the published Commerce schema/migrations before importing an
   account-scoped Customer Order repository/service.
2. Add real order list/detail queries with ownership tests for another account and
   a missing order.
3. Decide whether `/account` replaces legacy `/dashboard`, then add safe redirects.
4. Version the compatible pet/tag/medical/photo/notification foundations before
   exposing those portal areas.
5. Add profile editing only after baseline schema fields and audit requirements are
   independently reviewed.

## Scope confirmation

No migration, schema, RLS, Storage, Stripe, checkout, Event Demo, Coming Soon,
catalogue, pricing, remote environment, push or deployment operation was performed.
