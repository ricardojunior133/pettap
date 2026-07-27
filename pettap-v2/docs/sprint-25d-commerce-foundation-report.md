# Sprint 25D — Versioned Commerce Foundation Report

## Status

**READY FOR SPRINT 25E** — the Commerce foundation is versioned locally only.
No route, component, Customer Portal integration, Checkout, Stripe, webhook,
Admin, production, packing, or shipping operation was added or changed.

## Imported migrations

- `0001_enable_rls_and_account_isolation.sql` — imported as the required RLS
  dependency for Commerce owner policies.
- `0003_commerce_and_operations_foundation.sql` — imported unchanged as the
  initial Commerce foundation.
- `db/migrations/meta/_journal.json` now includes the original metadata for
  `0001` and `0003` after `0000`.

No migration was applied locally or remotely.

## Imported schema

`db/schema/commerce.ts` represents only the objects created by `0003`:

- Enums: product, variant, price, address, order, payment, fulfilment, and
  production statuses/types.
- Tables: products, variants, prices, inventory, customers, customer addresses,
  shipping methods, orders, order items, payments, fulfilments, and status
  history.
- Foreign keys, checks, unique indexes, and the named operational indexes are
  represented in the Drizzle schema.

Checkout attempts, Stripe webhook events, transactional notifications, and order
admin notes were intentionally excluded because they were introduced by later
sprints/migrations.

## Imported server foundation

- Repositories: customer, customer address, order, and customer order.
- Services: authenticated Commerce account resolver, customer, customer address,
  order read, customer order, order totals, and order transition validation.
- Contracts: Commerce and customer-order DTOs plus customer/address/order/
  personalisation Zod schemas.

Every owner-scoped repository accepts the account identifier only from a
server-side resolver. No route or Server Action has been connected in this sprint.

## Security and constraints

- `0003` enables RLS on all its Commerce tables.
- `anon` and `authenticated` grants are revoked before selective, owner-scoped
  grants/policies are added.
- Customer, address, order, item, fulfilment, and history access all depend on
  `public.current_account_id()` from `0001`.
- Foreign keys use the original restrictive deletion behaviour; the history actor
  reference uses `SET NULL`.
- Non-negative totals/prices and uniqueness constraints are retained from the
  original foundation.

## Conflicts resolved

The original Commerce services imported their account resolver from a Pets module
that is not part of this isolated release. The services now use the existing
baseline server-session helper through `commerce-account-service.ts`. This
preserves server-side session resolution without importing the Pets domain or
accepting an account id from browser input.

## Deliberately excluded

- Commerce actions and UI components.
- Checkout, Stripe, payment webhooks, notifications, Admin, production, packing,
  shipping, and public tracking integrations.
- Migrations `0002` and `0004`–`0010`.
- Any remote migration/deployment or data operation.

## Tests added

`tests/commerce-foundation.test.ts` covers the imported schema graph, migration
dependency contract, Zod normalization/strictness, order totals, state
transitions, and service-level account scoping with local fakes.

## Quality gates

| Gate | Result |
| --- | --- |
| Lint | PASS |
| TypeScript | PASS |
| Tests | PASS — 9 files, 47 tests |
| Production build | PASS |

## Sprint 25E prerequisites

Before connecting `/account/orders` and `/account/orders/[orderNumber]`, verify
the remote Drizzle ledger and actual database schema with a separately authorised
read-only preflight. Do not assume that importing source files applies `0001` or
`0003` to any environment. Sprint 25E should then wire only owner-scoped,
no-store order reads to these versioned services.
