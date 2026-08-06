# Production readiness

## What this sprint hardens

- HTTP security headers and a static-compatible Content Security Policy.
- Process-local rate limiting for sign-in, registration, checkout attempts and public NFC reads.
- Defence-in-depth same-origin checks on high-risk Server Actions. Next.js Server Actions retain their built-in origin protection.
- A public, no-store health endpoint at `/api/health`; it discloses only `ok` or `degraded`.
- Structured, privacy-safe server logs for Vercel log ingestion and future Sentry forwarding.
- Public metadata, canonical URLs, social metadata, structured data, sitemap and robots rules.

## Required production configuration

1. Set `NEXT_PUBLIC_SITE_URL` to the final HTTPS origin.
2. Configure production Supabase URL, anon key, service-role key and database URL in Vercel only.
3. Set Stripe **live** secret and webhook secrets only after validating the live webhook endpoint.
4. Verify the Resend sending domain, then configure `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_REPLY_TO` and `EMAIL_SUPPORT`.
5. Generate a unique `MEDICAL_ENCRYPTION_KEY`; do not reuse development material.
6. Turn off `PETTAP_COMING_SOON_MODE` only after the full public application is approved.
7. Configure Supabase backups/PITR according to the selected plan and verify restore ownership.
8. Rotate all development secrets that may have appeared in local diagnostics before sharing logs or the repository.

## Monitoring

Vercel captures structured JSON output from `lib/observability/logger.ts`. Configure Vercel Analytics in the Vercel project; it does not require a client-side tracker in this repository. Sentry is deliberately not activated until its DSN and SDK approval are available—do not add a client-exposed DSN or send customer data to an error provider.

## Operational checks before launch

- Confirm `/api/health` returns `200` without revealing configuration.
- Confirm the Stripe live webhook has a valid signature and idempotency remains intact.
- Confirm Resend SPF, DKIM and DMARC verification.
- Confirm the production canonical domain, redirect rules, sitemap and robots output.
- Complete a controlled live-like test in a non-production environment: authenticated checkout, guest checkout, production, packing, shipping, tracking, cancellation and notifications.
- Review all administrator memberships and permissions; remove temporary accounts.
- No scheduled jobs currently exist. Any future cron job must use a dedicated secret and idempotency key.

## Limitations

The current rate limiter is process-local. It is effective for a single runtime but must be replaced by a shared Vercel/Redis/KV limiter before relying on it for distributed abuse protection. This repository prepares the call sites without choosing a provider.
