# Environment

Required server values: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_CONTACT_EMAIL`. `lib/backend/env.ts` parses these only when a backend client is requested, allowing the Coming Soon build to remain safe before Supabase is provisioned. Never expose the service role key to the browser.

`MEDICAL_ENCRYPTION_KEY` is also required before medical profiles can be created or read. It must be a base64-encoded 32-byte server secret and must never use a `NEXT_PUBLIC_` prefix.

## Stripe Test Mode

Checkout requires `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` only when payment processing is enabled. `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` may be configured for future browser-side Stripe features, but the hosted Checkout flow does not expose or require it. Development accepts Test Mode keys only (`sk_test_` and `whsec_`). `NEXT_PUBLIC_SITE_URL` is the approved application URL used for Stripe success and cancellation redirects. See [Stripe Test Mode](./commerce/stripe-test-mode.md); Live Mode remains disabled.
