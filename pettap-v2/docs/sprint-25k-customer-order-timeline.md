# Sprint 25K — Customer Order Timeline

## Canonical sources

The customer timeline is built server-side only after the owner-scoped order lookup succeeds. It uses, in priority order:

1. `order_status_history` for matching public order transitions;
2. `payments.paid_at` for payment confirmation when history has no paid transition;
3. `fulfilments.shipped_at` and `fulfilments.delivered_at` for shipping evidence;
4. persisted order, fulfilment, and production enum states as timestamp-free progress evidence.

No current time, estimate, or invented timestamp is used.

## Public model

Each timeline item contains only `key`, `label`, `description`, visual `status`, and optional `occurredAt`. Raw history, actor IDs, reasons, table names, payment references, Stripe data, audit data, and internal metadata remain in the repository and are not included in the detail DTO.

## Mapping

- `paid` / paid payment → Payment received
- `in_production`, `queued`, or `printing` → In production
- `quality_check` or completed item production → Printed
- `ready_to_ship` / ready fulfilment → Packed
- `shipped` / shipped fulfilment → Shipped
- `completed` / delivered fulfilment → Delivered
- `cancelled`, refunded order state, or cancelled fulfilment → Cancelled

The sequence is always Payment received, In production, Printed, Packed, Shipped, Delivered. Unknown historical states are ignored.

## Cancellation and incomplete data

Cancelled orders show only evidenced prior progress, then a terminal Cancelled item. Delivered never becomes completed for a cancelled order. Missing timestamps remain absent while the known state can still determine visual progress. Duplicate and out-of-order history is deduplicated deterministically using the earliest corresponding timestamp.

## UI and accessibility

The detail route renders a semantic ordered list with text labels and visual state text, so meaning does not depend on colour. Decorative timeline markers are hidden from assistive technology; timestamps use `time` elements and server-side en-GB formatting. The vertical layout is mobile-first and has no horizontal timeline overflow.

Tracking remains visible only when a persisted tracking number exists. This baseline has no canonical public tracking route, so no broken CTA or carrier integration is added.

No migration, schema, Checkout, Stripe, webhook, Admin, Event Demo, Production Centre, remote data, push, or deployment changes are part of this sprint.
