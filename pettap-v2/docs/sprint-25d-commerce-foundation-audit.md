# Sprint 25D — Commerce Foundation Audit

## Scope

This is a source-control audit only. No database connection, migration execution,
seed, deployment, or remote configuration change was performed.

## Compared sources

| Source | Result |
| --- | --- |
| Isolated release baseline | Contains `0000_chilly_nebula.sql` and the Event Demo SQL file. Its Drizzle journal records only `0000_chilly_nebula`. |
| Original workspace | Contains the full ordered migration history from `0000` to `0011`, including the Commerce foundation. |

## Migration review

### `0001_enable_rls_and_account_isolation.sql`

- Depends on the core tables created by `0000` and Supabase `auth.uid()`.
- Creates `public.current_account_id()`, grants it only to `authenticated`, enables
  RLS on the original core tables, adds supporting indexes, and creates owner-scoped
  policies.
- Is required before `0003`: every customer-facing Commerce policy calls
  `public.current_account_id()`.
- Uses `DROP POLICY IF EXISTS` for policy replacement, but it is not a universally
  idempotent migration because its function/index/table operations still assume the
  expected prior database state.
- Has no down migration. Rollback therefore requires a separately reviewed,
  manual database plan rather than replaying this file backwards.

### `0003_commerce_and_operations_foundation.sql`

- Depends on `0000` for `accounts` and on `0001` for `public.current_account_id()`.
- Creates the initial Commerce enums and the following tables: `products`,
  `product_variants`, `product_prices`, `inventory_items`, `customers`,
  `customer_addresses`, `shipping_methods`, `orders`, `order_items`, `payments`,
  `fulfilments`, and `order_status_history`.
- Defines foreign keys, non-negative/check constraints, unique keys, and the
  expected operational indexes.
- Enables RLS on every Commerce table. `anon` and `authenticated` have their
  default grants revoked; authenticated customer reads and address writes are
  explicitly owner-scoped through `current_account_id()`.
- It is intentionally not SQL-idempotent: a second direct application would fail
  on existing types/tables. Drizzle's migration ledger is the idempotency mechanism.
- It has no down migration. Restoring a previous state needs a reviewed rollback
  plan; it must not be inferred automatically.

## Compatibility decision

| Item | Classification | Decision |
| --- | --- | --- |
| `0001` account isolation | A — import | Required dependency for Commerce RLS policies. |
| `0003` Commerce foundation | A — import | Brings the versioned Commerce schema and RLS contract into source control. |
| `0002` Storage security | C — defer | Unrelated to Commerce tables. |
| `0004`–`0010` admin, checkout, Stripe, notifications | C — defer | Outside this sprint and not required for the `0003` foundation. |
| Commerce UI/routes/actions | C — defer | Sprint 25D imports no integration surface. |
| `order_admin_notes`, checkout/webhook/notification schema | C — defer | Introduced after `0003`; not part of the foundation being versioned. |

## Journal note

The isolated baseline journal does not currently claim that `0011` was part of a
continuous historical sequence. Sprint 25D therefore adds the original source
migrations and their original metadata entries for `0001` and `0003` without
rewriting existing remote history. Before any remote application, the deployment
team must reconcile the remote Drizzle ledger against the published Event Demo
release and use a separately approved migration-promotion plan. This sprint does
not apply or mark any migration remotely.

## Import boundary

The code import is limited to the `0003` schema contract and server-side Commerce
repositories, services, DTOs, validation schemas, and types. It excludes routes,
components, checkout, Stripe, webhooks, Admin, production, packing, and shipping
operations.
