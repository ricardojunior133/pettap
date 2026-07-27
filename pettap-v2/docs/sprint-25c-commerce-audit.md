# Sprint 25C — Controlled Commerce Foundation Audit

## Executive conclusion

The published baseline does not contain the Commerce foundation required to read
customer orders. The required tables, enums, schema exports and migrations exist
only as uncommitted local work in the original workspace. Under Sprint 25C's
constraints — no schema change, no migration import/application, no new table and
no production change — importing the customer-order repository would not be safe or
functional.

No Commerce repository, service, DTO, action, schema or UI was imported in this
sprint. Existing `/account/orders` routes remain deliberately safe-unavailable
states rather than querying undeclared tables or simulating customer data.

## Published baseline inventory

Tracked migrations in the effective application root:

| Migration | Present in baseline | Commerce relevance |
| --- | --- | --- |
| `0000_chilly_nebula.sql` | Yes | Contains only `future_orders`, not the operational orders model. |
| `0011_event_demo_foundation.sql` | Yes | Event Demo only. |

The baseline exports only `core`, `admin` and `event-demo` schemas. It has no
`commerce.ts` and no exports for `orders`, `order_items`, `payments`,
`fulfilments`, `customers` or `order_status_history`.

## Original workspace migration compatibility

| Migration | Baseline | Dependency | Classification | Decision |
| --- | --- | --- | --- | --- |
| `0001_enable_rls_and_account_isolation.sql` | No | `0000` | C — defer | Security foundation outside order-read scope. |
| `0002_pet_photo_storage_security.sql` | No | `0001` | D — discard | Storage/pet photos are outside scope. |
| `0003_commerce_and_operations_foundation.sql` | No | `0000`, `current_account_id()` from `0001` | C — defer | Creates all Commerce enums/tables/indexes/RLS, so cannot be imported or applied under current rules. |
| `0004_admin_rbac_foundation.sql` | No | `0000` | D — discard | Admin-only. |
| `0005_admin_customer_pet_nfc_management.sql` | No | `0004` | D — discard | Admin/pet/NFC scope. |
| `0006_admin_orders_production_fulfilment.sql` | No | `0003`, `0004` | D — discard | Admin operations only. |
| `0007_customer_privacy_controls.sql` | No | pet schema | D — discard | Pet privacy scope. |
| `0008_guest_commerce_and_stripe_foundation.sql` | No | `0003` | C — defer | Stripe/guest checkout foundation; explicitly prohibited. |
| `0009_stripe_payment_idempotency.sql` | No | `0008` | D — discard | Stripe-only. |
| `0010_transactional_notification_history.sql` | No | `0003` | C — defer | Depends on operational orders and adds notification table. |
| `0011_event_demo_foundation.sql` | Yes | `0000` | A — retain | Already published Event Demo migration; do not alter. |

`0003` is the essential dependency: it creates the operational Commerce schema,
including `customers`, `orders`, `order_items`, `payments`, `fulfilments`,
`order_status_history` and their owner-scoped RLS policies. It also creates the
`orders_account_created_idx` index used by customer-order queries. Importing only
the TypeScript repository/service without it would produce runtime relation errors
or encourage unsafe raw SQL.

## Candidate code classification

| Candidate | Classification | Reason |
| --- | --- | --- |
| `features/commerce/repositories/customer-order-repository.ts` | E — requires schema | Imports absent order/fulfilment schema and queries tables created by `0003`. |
| `features/commerce/services/customer-order-service.ts` | E — requires schema and pets service | Depends on the repository and an unversioned authenticated-account resolver. |
| `features/commerce/types/customer-orders.ts` | B — reusable later | Safe view-model types, but no value without a versioned service. |
| `features/commerce/components/CustomerOrders.tsx` | C — defer | Depends on service DTOs and real order routes. |
| `app/account/orders/page.tsx` original version | C — defer | Calls unavailable Commerce service. |
| `app/account/orders/[orderId]/page.tsx` original version | C — defer | Calls unavailable Commerce service and uses a different dynamic parameter contract. |
| `features/commerce/schemas/order.ts` | B — reusable later | Validation/types only; not required for safe read-only portal now. |
| `features/commerce/actions/customer-address-actions.ts` | D — discard | Address mutation is outside customer order reading. |
| `features/guest-commerce/**` | D — discard | Checkout, Stripe and guest flow are prohibited. |
| Admin/production/packing/shipping modules | D — discard | Explicitly prohibited. |

## Security assessment

The original `CustomerOrderRepository` has the correct core ownership predicate:
`orders.account_id = authenticated account ID` for both list and detail queries.
The detail query also scopes all items, fulfilment and history through the selected
owned order. The service removes IDs from the output DTO and filters personalisation
to an allowlist.

That design cannot be certified or imported independently because its schema,
RLS policies and session/account resolver are not versioned in the baseline. No
order query was run against the remote database in this audit.

## Timeline compatibility

The original service can build a timeline from order status history and fulfilment
timestamps: payment received, production started, packed/ready, shipped and
delivered. This requires `orders`, `order_status_history` and `fulfilments`, all
introduced by `0003`. The portal therefore retains a safe unavailable state rather
than presenting an incomplete timeline.

## Required prerequisite for Sprint 25D

Before importing real customer orders, authorize a separate migration/schema
versioning sprint that:

1. reviews and commits `0001`, `0003` and any necessary dependent migration files
   in their correct order;
2. commits the matching Drizzle schema and journal entries without regenerating or
   modifying approved SQL;
3. confirms the intended development database state separately; and
4. adds customer-order repositories/services with ownership tests in the same
   versioned foundation.

Only after that foundation is versioned can `/account/orders` and
`/account/orders/[orderNumber]` be connected to real data safely.
