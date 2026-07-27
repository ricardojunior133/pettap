# Sprint 25B — Controlled Customer Portal Import Plan

## Scope and application root

The effective Next.js application root is
`C:\Users\ricar\premium-account-portal\pettap-v2\pettap-v2`. Its
`package.json` owns the production scripts and contains the dependencies required
by the published Event Demo/Coming Soon application.

The clean branch starts from `a4adc59b86e095993d6c584ad5a43f9b21c9ee4b`.
The source workspace is inspected read-only at
`C:\Users\ricar\pettap\pettap-v2`.

## Baseline facts

- The baseline contains accounts and profiles in `db/schema/core.ts`.
- It contains session-aware Supabase server helpers, a database client, login and
  Event Demo admin protection.
- It does **not** contain Commerce schema exports or migrations 0003–0010.
- It does **not** contain customer order, customer profile, address, pet, tag,
  medical, photo, notification, or Lost Mode repositories/services/actions.
- `proxy.ts` currently redirects all non-public routes to `/` while Coming Soon
  mode is active. `/account/**` therefore needs an explicit authenticated-route
  allowance before it can function.

## Candidate classification

| Category | Candidate | Reason / decision |
| --- | --- | --- |
| A | `lib/backend/auth/get-current-user.ts`, `lib/backend/db.ts`, `lib/backend/env.ts`, `lib/backend/supabase/server.ts` | Already present and equivalent in baseline; reuse, do not copy. |
| B | `app/account/layout.tsx`, `app/account/page.tsx`, `components/account/AccountShell.tsx` | Source versions depend on portal services/components not in baseline. Rebuild a minimal compatible shell instead of copying. |
| B | `proxy.ts` | Merge a narrow `/account/**` session branch while retaining Coming Soon, Event Demo and admin rules. |
| B | Customer profile read service | Reconstruct against existing `accounts`/`profiles` columns only; no new preferred-language column. |
| C | `db/schema/index.ts` | Do not export unversioned Commerce schema. Baseline export list remains unchanged. |
| D | `components/dashboard/**`, legacy `/dashboard/**`, `lib/dashboard/**`, mock dashboard files | Legacy/experimental and duplicate namespace; do not import. |
| D | `features/commerce/actions/customer-address-actions.ts` | Compressed local implementation, not needed for first read-only portal delivery. |
| E | `features/commerce/**`, `db/schema/commerce.ts`, Commerce order pages and order tests | Require unversioned Commerce schema/migrations and tables that are not part of the published baseline. Defer. |
| E | `features/owner/customer-profile-*` source implementation | Depends on profile fields such as preferred language not declared by the baseline schema. Reconstruct a read-only subset only. |
| E | pets, tags, medical, contacts, photos, notifications, Lost Mode | Depend on unversioned schemas/repositories and must be deferred. |

## Files not to import

- All `db/migrations/0001` through `0010` and all new schema files.
- Stripe, checkout, Commerce mutations, catalogue, Studio and Event Demo files.
- `node_modules`, `.next`, `.env*`, logs, uploads and generated artifacts.
- Any mock dashboard, local test data, admin or public-resolver code.

## Recommended controlled import order

1. Add the `/account/**` proxy exception and session guard.
2. Add a minimal account profile repository/service based only on baseline
   `profiles` fields and the authenticated user.
3. Add the reusable account shell and safe server-rendered `/account` overview.
4. Add a read-only `/account/profile` page.
5. Add `/account/orders` and `/account/orders/[orderNumber]` as explicit,
   non-misleading unavailable states until Commerce is separately versioned.
6. Add focused tests for session handling, safe profile DTOs, unavailable order
   states and route metadata.

## Security decisions

- Account identity is always resolved from `getCurrentUser()` on the server.
- No account ID, profile ID or order ID is accepted as an authority token from the
  browser.
- The profile DTO exposes only display name, phone and the authenticated email.
- Order details are not queried while the published source-of-truth schema is
  absent; this avoids accidental access to undeclared data.
- `/account/**` will be `noindex, nofollow` and `private, no-store`.

## Risks and conflicts

1. The source workspace's customer platform is uncommitted and has dependencies
   outside the released baseline.
2. The source has both `/dashboard` and `/account` namespaces; this sprint will
   not import `/dashboard` or add redirects without a canonical-route decision.
3. The original Commerce source references tables and migrations absent from the
   baseline, so complete order history cannot be claimed in Sprint 25B.
4. The existing login page redirects authenticated users to admin Event Demo;
   that behavior is out of scope and remains unchanged.

## Expected deliverables of this sprint

- Authenticated `/account`, `/account/profile`, `/account/orders`, and
  `/account/orders/[orderNumber]` routes.
- Real authenticated profile data where the baseline profile exists.
- Clear, premium unavailable/empty order states rather than mock orders.
- No schema, migration, RLS, Storage, Stripe, Commerce, Event Demo or Coming Soon
  change beyond the minimal route protection required for `/account`.
