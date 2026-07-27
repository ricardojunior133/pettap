# Sprint 25I — Customer Orders Read Report

## Result

The customer portal can now list real persisted orders at `/account/orders` through a read-only, owner-scoped repository.

## Test data and remote data

No remote orders were queried, created, or changed for this sprint. The automated tests use local in-memory fakes, so **zero real orders were found during tests**.

## Security findings

- Reads are owner-scoped: **yes**. Both repository methods constrain `orders.account_id` to the authenticated account identifier.
- A changed order number cannot bypass ownership: **yes**. The lookup predicate combines account ID and order number.
- Sensitive fields exposed: **none**. The DTO excludes internal IDs, Stripe/payment data, customer and account IDs, audit records, metadata, and address snapshots.
- SQL errors shown to the customer: **no**. The page renders a generic retry message.

## Deliberate non-changes

- Checkout changed: **no**.
- Stripe changed: **no**.
- Schema changed: **no**.
- Migration created or applied: **no**.
- Remote data altered: **no**.

## Follow-up

Sprint 25J can safely reuse the repository and service to connect `/account/orders/[orderNumber]` with a separate, detail-safe DTO and timeline.
