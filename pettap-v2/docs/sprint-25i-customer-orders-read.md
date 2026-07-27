# Sprint 25I — Customer Orders Read Integration

## Scope

`/account/orders` now uses a server-side, owner-scoped read path:

`OrderRepository → OrderReadService → customer order Server Actions → Account orders page`.

The repository always filters with the authenticated account identifier. The browser supplies only an optional page number or an order number; it never supplies an account or customer identifier.

## Public customer DTO

The list and lookup return only:

- `orderNumber`
- `createdAt`
- customer-safe display `status`
- `total` and `currency`
- `itemCount`
- `trackingNumber` when present

`estimatedDelivery` is intentionally absent until a persisted source exists in the Commerce foundation; this sprint does not infer or invent delivery dates.

Database IDs, account/customer IDs, payment records, Stripe identifiers, internal metadata, audit records, and address snapshots are not selected or returned.

## Status mapping

The UI derives status only from the persisted `order_status` and `fulfilment_status` enums. It supports the customer vocabulary Paid, In Production, Packed, Shipped, Delivered, and Cancelled. `Printed` remains part of the display vocabulary for the next detail/timeline sprint, but there is no standalone persisted order-level `printed` enum value in the current Commerce foundation, so this list does not manufacture one.

## Pagination and privacy

Results are ordered by newest first, with order number as a stable secondary order. Pagination is server-side with 12 orders per page. Empty and error states are generic and never render database errors.

## Intentional boundary

This sprint does not connect `/account/orders/[orderNumber]`; that remains Sprint 25J. No checkout, Stripe, Event Demo, Admin, schema, or migration behavior changed.
