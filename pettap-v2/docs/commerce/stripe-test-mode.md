# Stripe Test Mode & Development Catalogue

## Safety

PetTap Checkout must use Stripe Test Mode until a separate live-payment launch approval. Set `STRIPE_SECRET_KEY` to an `sk_test_` key and `STRIPE_WEBHOOK_SECRET` to the Test Mode endpoint secret. `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is optional for the current Stripe-hosted redirect and reserved for a future Stripe.js surface. Never commit secrets, expose the secret key to the browser, or use an `sk_live_` key in development.

## Development catalogue

The only supported seed is deliberately opt-in:

```powershell
$env:PETTAP_COMMERCE_SEED = "1"
$env:PETTAP_COMMERCE_SEED_ENV = "development"
npm run db:seed:commerce
```

It creates or updates one active `PetTap Personalised NFC Tag` product and six active variants: Petite, Classic and Explorer in Matte and Gloss. Collection, shape, colour and engraving are not variants; they are validated server-side and retained in the immutable checkout/order snapshot. Prices are £19.99, £24.99 and £29.99 respectively. Shipping remains a server-owned £2.99.

The seed is idempotent and must never be run against production without an explicit production catalogue review.

## Local webhook forwarding

First verify which Stripe account the application key uses without exposing the key:

```powershell
$env:PETTAP_STRIPE_DIAGNOSTICS = "1"
node scripts/stripe-diagnostics.mjs
```

Log the Stripe CLI into that same Stripe Dashboard account in Test Mode, then forward only checkout completion events:

```text
stripe login
stripe listen --events checkout.session.completed --forward-to http://localhost:3000/api/stripe/webhook
```

Put the displayed `whsec_…` value in `STRIPE_WEBHOOK_SECRET`, restart the local app, and run diagnostics again. The application account ID must match the Test Mode dashboard account selected during `stripe login`. The endpoint accepts only a valid Stripe signature and processes only `checkout.session.completed`.

## Repeatable Test Mode check

1. Configure `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` and `NEXT_PUBLIC_SITE_URL` in `.env.local`.
2. Run the development seed above.
3. Start the app and configure a PetTap in `/studio`.
4. Enter non-real test contact details and continue to Stripe Checkout.
5. Complete payment with a Stripe test card, for example `4242 4242 4242 4242` with a future date and any CVC.
6. Confirm development logs record a received event, found checkout attempt and completed order promotion.
7. Confirm the database contains one event, one paid checkout attempt, one order, one order item and one payment.
8. Replay the same webhook event and confirm all counts remain one.

`stripe trigger checkout.session.completed` intentionally produces a session that is not owned by PetTap. The handler acknowledges it safely, records a non-sensitive ignored-event reason and never creates an order.

Do not include addresses, email addresses, card details, secrets or raw webhook payloads in logs or reports.
