# Sprint 25E — Remote Ledger Preflight (Read Only)

## Classification

**CONFLICT**

No migration, seed, deploy, push, database write, or remote configuration change
was executed. All remote activity in this sprint was PostgreSQL `SELECT` and
catalogue introspection only.

## Environment evidence

- A remote PostgreSQL connection was available through the configured local
  environment file. No variable value was printed.
- The connection reported PostgreSQL 17.6 and the `postgres` database role.
- The Drizzle ledger is `drizzle.__drizzle_migrations`.

## Remote migration ledger

The remote ledger has twelve ordered entries, corresponding to the original
history from `0000_chilly_nebula` through `0011_event_demo_foundation`.

| Migration | Remote ledger | Local isolated baseline source | Result |
| --- | --- | --- | --- |
| `0000_chilly_nebula` | Present | Present | Hash matches original source. |
| `0001_enable_rls_and_account_isolation` | Present | Present | **Hash conflict** — remote hash is `7cf313a1…`, baseline hash is `652d312d…`. |
| `0002_pet_photo_storage_security` | Present | Not versioned in this baseline | Extra remote history. |
| `0003_commerce_and_operations_foundation` | Present | Present | **Hash conflict** — remote hash is `723c72ef…`, baseline hash is `e3907e6e…`. |
| `0004`–`0010` | Present | Not versioned in this baseline | Extra remote history. |
| `0011_event_demo_foundation` | Present | Present | Remote hash matches the original workspace source. |

The remote `0001` and `0003` hashes match the original workspace files exactly.
The isolated baseline copies differ only by final blank-line/line-ending content,
but Drizzle hashes migration bytes, so this is still a ledger conflict. A future
migrator must not be run until the source-of-truth migration bytes and journal
strategy are reconciled in a separately authorised sprint.

## `0001` validation

- `public.current_account_id()` exists, returns `uuid`, and is a security-definer
  function.
- RLS is enabled on the original core tables, including all Commerce dependencies.
- No missing `0001` dependency was found for the Commerce policies.

## `0003` Commerce validation

### Expected tables

All twelve `0003` tables exist remotely:

`products`, `product_variants`, `product_prices`, `inventory_items`, `customers`,
`customer_addresses`, `shipping_methods`, `orders`, `order_items`, `payments`,
`fulfilments`, and `order_status_history`.

No `0003` table is missing.

### Extra remote tables

The remote database also contains later-domain tables, including Admin, Event
Demo, checkout, Stripe, transactional notification, privacy, and NFC extensions.
They are explained by remote ledger entries `0002` and `0004`–`0011`; they are
not evidence that a migration should be re-applied.

### Enums

All nine Commerce enums introduced by `0003` exist with the expected values:

- `product_status`, `product_type`, `variant_status`, `price_status`
- `address_type`, `order_status`, `payment_status`
- `fulfilment_status`, `production_status`

Additional enums (`checkout_status`, Stripe, Admin, Event Demo, NFC and lead
enums) are later-history objects, not missing or conflicting `0003` enums.

### Foreign keys and constraints

All expected `0003` foreign keys are present with the expected restrictive delete
behaviour. The history actor reference correctly uses `ON DELETE SET NULL`.
Expected primary keys, unique constraints, and non-negative/order arithmetic
checks are present.

### Indexes

All expected operational indexes are present:

- product variant/product, price/variant-currency-status, address/customer
- order/account-created and order/customer
- order item/order, payment/order, fulfilment/order, history/order

The remote `payments_provider_payment_id_unique` index is an extra later-history
index; it does not replace or invalidate a `0003` index.

### RLS policies

RLS is enabled (not forced) on each of the twelve Commerce foundation tables.
The expected owner-scoped policies are present for customers, addresses, orders,
order items, fulfilments, and order status history. No `USING (true)` policy was
observed in the Commerce foundation policy set.

### Triggers

No trigger exists on any of the twelve `0003` Commerce tables.

## Structural divergence

The remote `orders.customer_id` and `orders.account_id` columns are nullable.
`0003` originally creates them as non-null. This is a compatible later evolution
for guest checkout, reflected by the later remote migration history, but it means
the current remote schema is not an exact `0003` snapshot.

## Risk assessment

**High — migration ledger/source mismatch.** The remote schema is structurally a
superset of the Commerce foundation and contains all required `0001`/`0003`
objects. However, the isolated baseline's byte hashes for `0001` and `0003` do
not equal the applied ledger hashes. Running a migrator could treat already
applied migrations as unknown and fail against existing objects. This sprint must
end here.

## Required follow-up (not performed)

1. Reconcile the isolated baseline migration files with the exact original bytes
   recorded in the remote ledger.
2. Review the local journal strategy against the full remote `0000`–`0011`
   history.
3. Only after a new approval, perform a dedicated migration-ledger remediation
   preflight. Do not run `db:migrate` as part of Sprint 25E.
