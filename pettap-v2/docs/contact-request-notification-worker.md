# Contact request notification worker

The platform uses two intentionally separate private triggers for the queued
finder-contact notification worker. Neither route accepts notification IDs,
recipient details, request bodies, or query parameters.

## Manual internal trigger

`POST /api/internal/contact-request-notifications/process` is for trusted
internal infrastructure. It requires `Authorization: Bearer <CONTACT_NOTIFICATION_WORKER_SECRET>`.

## Vercel Cron adapter

`GET /api/internal/contact-request-notifications/cron` is reserved for Vercel
Cron. It requires `Authorization: Bearer <CRON_SECRET>`, which Vercel adds when
that environment variable is configured. The manual secret and the cron secret
are never interchangeable.

Both routes execute at most one batch of 20 eligible notifications. They return
only aggregate counters: processed, sent, retried, failed, and cancelled. Their
responses are `no-store` and `noindex`; no recipient, message, notification ID,
provider payload, or secret is logged or returned.

Retries retain the existing bounded backoff. A notification already sent,
cancelled, or awaiting a future retry is not eligible. The repository's
conditional atomic claim protects simultaneous manual and cron invocations.

## Processing lease and crash recovery

While a notification is `processing`, its `updated_at` is the persisted lease
start. It is written atomically by the claim and is not renewed while the
provider runs. After ten minutes, an unfinished `processing` notification is
eligible for the same conditional claim as pending and due-retry work. This
prevents a crash, timeout, or abrupt serverless shutdown from stranding it.

The claim increments the persisted attempt count once per delivery attempt;
recovery does not reset it. If a provider accepted a message before a crash
prevented `markSent`, the recovered delivery intentionally uses the identical
provider idempotency key derived from the notification ID. The provider is
therefore responsible for deduplicating that uncertain outcome.

On the Hobby schedule, an expired ten-minute lease may not be reclaimed until
the next daily Cron run unless an authorized internal worker is invoked.

## Scheduling status

The verified Vercel project is `pettap-coming-soon` under the PetTap team. Its
configured Root Directory is `pettap-v2`, which corresponds to this application
directory. The team is on the Hobby plan and `CRON_SECRET` is configured only
for Production.

`vercel.json` lives in this application root and schedules the GET Cron adapter
at `0 9 * * *`: daily at 09:00 UTC. The schedule is intentionally compatible
with the Hobby plan, which permits one cron invocation per day. This is
operationally insufficient for prompt finder-contact delivery; upgrade to Pro
or Enterprise before changing it to the intended five-minute cadence.

Cron will remain inactive until a Production deployment includes this
`vercel.json`. No deployment was performed as part of this setup.

## Local testing

Use the Console or Fake provider only. Configure a non-production local secret
in `.env.local`, call the applicable route with the matching Bearer header, and
inspect aggregate counters. Never use a real recipient or a production Resend
configuration for local validation.
