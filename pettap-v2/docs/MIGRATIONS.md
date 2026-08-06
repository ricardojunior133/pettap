# Migration application guide

## Pending review sequence

Apply the versioned migrations only in journal order. The current review covers:

1. `0006_admin_orders_production_fulfilment`
2. `0007_customer_privacy_controls`

## Development application record

On 24 July 2026, migrations `0006_admin_orders_production_fulfilment` and `0007_customer_privacy_controls` were applied to the confirmed PetTap development Supabase environment through the project migrator. The remote Drizzle journal recorded both migrations after entries 0000–0005.

The post-application structural verification confirmed the administrative-note table and constraint, the nullable pet archive column and index, the private preference table, private defaults, RLS, owner-scoped policy and grants. No seed, test data, customer data, memberships or preference rows were created by the operation.

Remote cross-account tests and signed-in route smoke tests remain limited by the absence of designated test accounts and data. They must be performed in a controlled test environment before production application.

Migration 0006 depends on the commerce schema from 0003 and the RBAC roles and permissions from 0004. It creates `order_admin_notes`, adds the related index and adds idempotent system permissions. It does not create customer orders, products, fulfilments, memberships or test data.

Migration 0007 depends on the base `pets` table and the RLS helper introduced earlier. It adds nullable `pets.archived_at`, its owner-query index, and `pet_public_preferences`. Existing pets need no backfill; a missing preference row is deliberately interpreted by the application as private defaults.

## Pre-application checklist

- Confirm `db/migrations/meta/_journal.json` is the only Drizzle journal and contains the migrations in order.
- Review the target database environment and take the normal operational backup according to the database provider's procedure.
- Run lint, tests, TypeScript and production build from the matching commit.
- Apply only through the existing migration command in a maintenance window appropriate for the table sizes. The index statements are regular `CREATE INDEX` operations and can briefly contend with writes on busy production tables.
- Do not run seeds as part of this application.

## Security expectations

`order_admin_notes` has RLS enabled with no direct grants to `anon` or `authenticated`; application access remains server-side and RBAC-gated. `pet_public_preferences` grants only owner-scoped select, insert and update access to authenticated users. It intentionally has no delete grant because the application uses an idempotent upsert and private defaults instead of destructive preference deletion.

## Rollback

No automatic rollback is supplied. Reversing an applied production migration must be an explicit, reviewed migration after assessing dependent application code and existing data. Do not manually drop the tables or columns in the provider dashboard.
