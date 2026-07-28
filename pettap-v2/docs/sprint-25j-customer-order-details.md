# Sprint 25J — Customer Order Details

## Architecture

The detail route extends the read-only path delivered in Sprint 25I:

`OrderRepository → OrderReadService → customer order Server Action → /account/orders/[orderNumber]`.

The initial repository query combines `orders.account_id` and `orders.order_number`. Only after that query proves ownership are order items and fulfilment read using the repository-private order identifier. That identifier never leaves the repository.

## Customer-safe detail DTO

The route receives only:

- order number, creation date, derived customer status, and currency;
- minor-unit subtotal, shipping, discount, tax, and total;
- item product/variant names, public SKU, quantity, unit price, line total, and allowlisted personalisation;
- carrier, tracking number, dispatch time, and delivered time when a tracking number exists.

The DTO removes order, account, customer, payment, fulfilment, webhook, Stripe, metadata, audit, internal-note, cost, margin, hash, and idempotency fields. Address snapshots are deliberately not included in this sprint.

## Personalisation allowlist

Only `collection`, `petName`, `colour`, `lineColour`, `primaryColour`, `accentColour`, `font`, `shape`, `size`, `finish`, and `material` are returned. Unknown keys are discarded server-side.

## Financial treatment

Persisted values remain authoritative and stay in integer minor units through the repository and service. The UI formats values with `Intl.NumberFormat` only at presentation time. Tests validate `subtotal + shipping + tax - discount = total` without floating-point arithmetic.

## Tracking

Tracking is shown only when a persisted tracking number exists. This isolated baseline does not contain a canonical `/track/[orderNumber]` route, so it intentionally does not render a broken tracking link or create a carrier integration.

## Route behavior

- `loading.tsx` presents a skeleton during server loading.
- `notFound()` handles missing, malformed, and unowned order numbers identically.
- `error.tsx` renders a generic retry experience and never shows database or authentication details.

No migration, schema, Checkout, Stripe, webhook, Admin, Event Demo, deployment, push, or remote data operation is part of this sprint.
