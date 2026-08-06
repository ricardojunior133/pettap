# Commerce release gates

## Current order foundation

The versioned commerce schema contains normalized products, variants, prices, orders, order items, payments and fulfilment records. It is a private foundation; it is not a public checkout.

## Guest checkout & Stripe

Migration `0008_guest_commerce_and_stripe_foundation.sql` adds the guest checkout attempt, Stripe identifiers and idempotent webhook-event model. It has been applied to the confirmed development environment. Sprint 18B now provides the server-side mapping and Stripe Checkout path, but it remains release-gated until active catalogue records and Stripe Test Mode credentials are configured.

## Fulfilment

The schema contains private production and fulfilment states. Customer-facing fulfilment must only be enabled after orders are paid through a verified webhook.

## Administration and refunds

Administrative operations remain private. Refund reconciliation remains a future payment-processing task.

## Next release gate

The development catalogue is provisioned: one product, six size-by-finish variants and six active GBP prices. Stripe Test Mode secrets are still required to conduct an end-to-end payment and local webhook delivery. Do not enable live-mode keys before that test completes.
