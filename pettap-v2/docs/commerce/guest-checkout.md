# Guest Checkout & Stripe Foundation

## Summary

Sprint 18A establishes PetTap's private, server-side foundation for guest checkout. Sprint 18B adds the Stripe Checkout integration path, while preserving server-side pricing, an opaque session confirmation and webhook-only order promotion.

## Guest purchase model

`checkout_attempts` is the pre-payment record for both a guest and a future signed-in buyer. It stores validated customer details, an immutable shipping-address snapshot, an immutable product configuration snapshot, server-calculated amounts and a random internal reference. A guest does not receive a Supabase account or a `customers` row automatically.

`orders.account_id` and `orders.customer_id` are nullable through migration `0008_guest_commerce_and_stripe_foundation.sql`, applied to the confirmed development environment. This is an explicit guest-order model, not a bypass of account isolation: existing RLS policies continue to return orders only when an authenticated account owns them. No guest-order lookup route exists.

## Pricing authority

The browser may submit only catalogue identifiers and the pet name. `GuestCheckoutService` validates them with Zod and rebuilds the SKU, size price, GBP currency and the fixed £2.99 shipping charge on the server. Browser-provided prices, totals, currency, discounts and SKU are rejected by the strict input schema.

## Payment lifecycle

Checkout attempt states are separate from the existing operational order and payment states:

`draft → pending_payment → paid | payment_failed | expired | cancelled`

An order is not created by `/checkout/success` or by a browser redirect. In Sprint 18B, a successfully verified Stripe event will atomically claim `stripe_webhook_events`, promote the checkout attempt and create or link exactly one paid order. The unique `stripe_event_id` protects webhook retries from duplicating that work.

## Stripe configuration

Set these server-only variables only when Sprint 18B is approved:

```text
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

`NEXT_PUBLIC_SITE_URL` is the approved application URL already used by the project. Stripe credentials are parsed lazily, so normal builds and non-payment routes work without them. Never prefix these secrets with `NEXT_PUBLIC_`.

## Webhook route

`POST /api/stripe/webhook` uses the raw request body and verifies the `stripe-signature` before processing only `checkout.session.completed`. It intentionally has no user session requirement. The proxy allows this exact endpoint together with `/checkout`, `/checkout/success` and `/checkout/cancel`; it does not allow a broad `/api` prefix.

The event ledger retains event IDs, type, processing state and timestamps only. It does not store raw Stripe payloads, card data, customer addresses or secrets.

## Security and future account association

The new tables have RLS enabled and all access is revoked from `anon` and `authenticated`; only server repositories may access them. A later authenticated, owner-authorized service may associate a guest order with an existing account/customer. This association must not accept account or customer IDs from the browser.

## Scope limitations

- Migration `0008` has been applied to the confirmed development environment only.
- Stripe Test Mode credentials and a persisted active catalogue are still required before an end-to-end test payment can be run.
- The catalogue currently has no active product, variant or price records in the development database; checkout fails safely until that commercial data is approved and provisioned.
