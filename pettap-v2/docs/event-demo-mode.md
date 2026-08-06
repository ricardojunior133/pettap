# PetTap Event Demo Mode — Foundation

## Summary

Sprint 1A establishes the private database and domain foundation for a time-limited, in-person PetTap demonstration. It intentionally creates no public routes, user interface, activation flow, photo upload, scheduled job, or Coming Soon integration.

## Data model

`event_demo_tags` represents a physical demonstration tag. Its random `public_code` is distinct from its internal UUID and is never an incremental identifier. A tag has a 10–240 minute session duration (60 minutes by default), usage counter, availability state, and operational reset timestamps.

`event_demo_sessions` is a temporary visitor session belonging to one demo tag. It has an unguessable `public_id`, an SHA-256 hash of an opaque session token, expiry/deletion timestamps, optional profile fields, visibility preferences, and distinct demo and marketing consent records. No home address, IP address, user-agent, or raw token is stored.

`leads` is the reusable, normalized-email store for explicit marketing leads from Coming Soon, demos, fairs, or manual capture. Demonstration consent is never reused as marketing consent.

## States

Demo tags: `available`, `in_progress`, `completed`, `expired`, `disabled`.

Demo sessions: `started`, `profile_created`, `completed`, `expired`, `deleted`.

All session visibility preferences default to `false`. A future public resolver must filter fields in its service layer before producing a view model.

## Sprint 1B lifecycle

### State machine

Tag transitions are centralised: `available → in_progress`, `in_progress → completed|expired`, `completed|expired → available` after a successful reset, and any tag can be disabled. A disabled tag may only become available through an explicitly authorised administrative operation after no valid session remains.

Session transitions are centralised: `started → profile_created → completed`, active states may expire after `expires_at`, and an expired or administratively reset session becomes `deleted` only after safe cleanup. Invalid transitions are rejected by domain errors.

### Concurrency and starting a session

`startSessionForTag` delegates to one database transaction. It locks the `event_demo_tags` row with `FOR UPDATE`, validates availability, checks for another valid session, then creates the session, sets the tag to `in_progress`, increments usage, updates `last_used_at`, and writes non-PII audit metadata. This prevents two simultaneous taps from producing valid sessions. An expired prior session is first marked expired and must be cleaned before a new session can start.

### Token ownership

An initial call returns an opaque cryptographic token exactly once. The session table receives only its SHA-256 hash. All later reads or updates require the matching token and use timing-safe verification. Invalid-token errors remain generic for future public handlers.

### Progressive profile data and consent

Sessions accept only the documented pet, contact, consent, and visibility fields. Empty optional fields become `null`; email is lower-cased and validated. A visibility setting cannot be enabled without the matching stored value. Demo consent is independent from marketing consent. A session can become `profile_created` only with pet name, species, valid demo-consent proof, and an unexpired token. Since upload is intentionally out of scope, final completion returns a `photo_pending` domain error until a real Storage workflow has supplied a path.

### Leads

Completion only calls `LeadService` when marketing consent is true and an email exists. It uses normalized-email upsert with an allowed `event_demo` or `fair` source; no lead is stored for absent consent. The audit event contains only tag/session identifiers and source.

### Expiry, cleanup, and reset

Expiry is idempotent: eligible sessions move to `expired` and their tag becomes `expired`. Cleanup uses the `EventDemoTemporaryStorage` interface. If a photo path exists, deletion must succeed before the database clears any PII or the path. On success, cleanup removes pet/contact fields and visibility/consent values, marks the session deleted, and returns the tag to `available` atomically. On Storage failure the session remains recoverable and the tag is not released.

Administrative reset requires the existing `event_demo.manage` permission. It uses the same cleanup path and records an identifier-only reset audit event. `cleanupExpiredDemoSessions(limit)` is bounded and returns inspected, expired, cleaned, and failed counts for a future cron, admin command, or tap-time recovery.

### Operational runbook (future)

1. An authorised operator registers or enables physical demo tags.
2. A future handler starts a session for a scanned tag and returns the opaque token only over its secure response.
3. A future UI saves progressive data through the ownership-checked service.
4. Operators may invoke the bounded cleanup method periodically; retry failed Storage cleanups before reusing a tag.
5. Never manually make a tag available while a session still contains a Storage path or personal data.

Audit events are limited to IDs, state, source, and non-sensitive internal error codes. Names, contact values, token values/hashes, personality, breed, and Storage paths are excluded.

## Tokens and retention

Public codes, public IDs, and session tokens are generated with Node cryptographic randomness. The database stores only a SHA-256 hash of the session token and future verification uses timing-safe comparison. Planned retention is logical expiry/deletion first, followed by a future scheduled cleanup process that includes Storage cleanup; neither process exists in Sprint 1A.

## Permissions and access

The migration adds `event_demo.view` and `event_demo.manage` to the existing RBAC catalogue. They are granted idempotently to Operations, Administrator, and Super Administrator roles. The three new tables enable RLS and revoke direct `anon` and `authenticated` access. No policies are created because no public or client-side database access exists in this foundation.

## Not implemented yet

- Public demo flow and temporary profile
- Upload and signed image delivery
- Public Server Actions, activation routes, or UI
- Admin pages and tag reset workflow
- Storage cleanup and retention cron
- Public analytics or event logging
- Final Coming Soon/waitlist integration

## Next stages

The next implementation should add server-authorized operational workflows and only then public routes that resolve a valid tag and short-lived session. Any future public data must remain filtered by visibility preferences, must validate token ownership server-side, and must not expose database or Storage paths.

## Sprint 1C activation experience

`/event/activate/[publicCode]` is a private, noindex, no-store activation experience for an authorised physical Event Demo tag. It is intentionally not a public finder profile. The route is allowed during Coming Soon mode only for this limited demo flow.

The browser never receives a session token through HTML, URL parameters, local storage, or analytics. After a successful start Server Action, an HttpOnly, `SameSite=Lax`, production-secure cookie is stored under a name scoped to that tag's public code and with path `/event`. The cookie contains the route-safe session public ID and opaque token, and expires with the session. Every later action resolves ownership from this cookie.

### Photo handling

Event photos use the existing private `pet-photos` Supabase bucket, segregated under `event-demo/<demoTagId>/<sessionId>/<random>.webp`. Server-only service-role access handles upload, signing, and deletion. The app never persists a signed URL; it creates a five-minute URL only for an authorised preview. JPG, PNG, and WebP inputs up to 5 MB are decoded using Sharp, orientation-corrected, metadata-stripped through re-encoding, bounded to 25 million input pixels, resized to 1600px, and stored as WebP. SVG and unsupported inputs are rejected.

Replacing a photo uploads and records the new private object before attempting to remove the old one. If persistence fails, the new object is removed. If removal of an old object fails, the current photo remains valid and cleanup records an identifier-only error for later retry.

### Running the activation demo locally

1. Create a development-only Event Demo tag with `npm run event-demo:create-tag -- --name="Fair Demo 01"`. The CLI refuses `NODE_ENV=production`, returns only the internal label, public code, and activation URL, and uses `EventDemoTagService`.
2. Open `/event/activate/<publicCode>` in a browser with cookies enabled.
3. Start the demo, enter pet details, upload a photo, choose privacy preferences, and review the preview.
4. Complete the profile or select Cancel demo.
5. Confirm cleanup removes personal data and the private object before reusing the tag.

The current application intentionally has no public final profile route, admin UI, bulk tag generator, external cron, or analytics dashboard.

## Sprint 1D temporary public profile

The second tap resolves `/event/activate/[publicCode]` against the actual latest session, not the tag status alone. A completed unexpired session redirects to `/event/profile/[sessionPublicId]`; an incomplete session is restored only when the per-tag HttpOnly cookie proves ownership; an incomplete session belonging to another browser shows an occupied state. Expired sessions attempt lifecycle cleanup before the tag returns to activation. Cleanup failure keeps the tag unavailable.

`/event/profile/[sessionPublicId]` accepts only the validated public ID and is noindex, nofollow, private/no-store, and omitted from the sitemap. Its server-side DTO excludes every internal/session/security/consent field. Optional fields are included only when the corresponding visibility flag is true. The route uses a short signed image URL from private Storage, with a non-sensitive placeholder on signing failure. It does not generate person-specific metadata or social cards.

### Testing the full two-tap event experience

1. Run `npm run event-demo:create-tag -- --name="Fair Demo 01"` only against development.
2. Open the activation URL, complete pet details, private photo, and consent.
3. Choose only a subset of sharing preferences, then create the profile.
4. Open the displayed public profile in a private browser window and confirm only permitted fields appear.
5. Tap/open the activation URL again and confirm redirect to the profile.
6. In the owner browser select **Cancel and remove my demo** and confirm the public route becomes unavailable.
7. Confirm the tag can be reused only after Storage cleanup succeeds.

## Sprint 1E: private fair operations console

`/admin/event-demo` is a private, noindex operational console for running the demo safely on a phone, tablet, or laptop. It is accessible only to an authenticated administrator with `event_demo.view`; mutating controls and CSV exports additionally require `event_demo.manage` and are enforced server-side. The admin shell now recognises operators who have Event Demo access but do not have the broader dashboard permission.

The console shows aggregate, non-PII metrics: tag state totals, sessions started today, completed profiles today, public profile views today, marketing consents today, completion rate (`completed profiles / started sessions`, zero-safe), and cleanup attention counts. It presents only masked session references plus operational lifecycle fields. Pet, owner, contact, token, signed URL, and Storage-path data are never part of the operational session table.

### Tag preparation and operation

An operator can create one tag or a validated batch of 1â€“20 tags. Batch labels are predictable (`<prefix> 01`, `<prefix> 02`) but public activation codes are cryptographically random. Creation is explicit and audited. Activation URLs use `NEXT_PUBLIC_SITE_URL` when configured, otherwise remain relative URLs; no localhost, Vercel, or PetTap host is hardcoded.

The tag export is an in-memory UTF-8 BOM CSV compatible with Excel in the UK. Its columns are `internal_name`, `public_code`, `activation_url`, `status`, and `session_duration_minutes`; it never contains internal UUIDs or secrets. Every CSV cell beginning with `=`, `+`, `-`, or `@` is prefixed for spreadsheet-formula protection and quote-escaped. The lead export uses only explicit marketing-consent records from `event_demo` or `fair` sources and includes only first name, email, source, consent version, and consent time.

Reset uses the existing lifecycle service and private Storage cleanup. A tag becomes available only after photo deletion and PII cleanup succeed. On failure it remains unavailable and the operator can retry reset/cleanup. A tag with a valid active session cannot be disabled; reset it first. Enabling restores an eligible tag to `available`. Administrative actions are rate limited, same-origin checked, private/no-store, and produce identifier-only audit metadata.

## Fair runbook

### Before the fair

1. Confirm the correct environment, private `pet-photos` Storage, and an administrator with both Event Demo permissions.
2. Open `/admin/event-demo`, create only the number of tags required, and export the tag CSV.
3. Program each physical NFC tag using its activation URL, label it with the internal name, and test every tag on a mobile device without login.
4. Test a complete activation, public profile, reset, and retry-cleanup failure path with development data before relying on the station.
5. Keep one verified spare tag and a mobile connectivity fallback. QR codes, if ever shown externally, remain a backup to the same activation URLâ€”NFC is the source of truth.

### During the fair

1. Keep the private admin console supervised; never leave it open for visitors.
2. Use the tag table to check `In use`, `Profile ready`, `Expired`, and `Cleanup required` states.
3. Reset each completed demonstration only after the visitor is finished; do not manually force a tag available.
4. Use **Clean expired sessions** periodically and retry any failed cleanup before reusing the tag.
5. Export only explicit marketing-consent leads. Do not collect data outside the consent flow.

### After the fair

1. Export authorised leads, run cleanup until no temporary sessions require attention, then verify temporary photos have been removed.
2. Disable every demo tag after its final reset.
3. Review aggregated metrics and identifier-only audit logs; do not retain screenshots containing visitor information unnecessarily.

No external cron, marketing delivery, permanent tag transfer, automatic QR source of truth, or remote infrastructure change is introduced by Sprint 1E.
