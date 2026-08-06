# Public NFC resolver

`/pet/[tagId]` now resolves NFC public IDs from `nfc_tags` through `PublicTagService`; it no longer reads rescue mocks.

Only an active or lost tag linked to a pet with `public_profile_enabled` can render a profile. Suspended, retired, unknown and orphan tags render neutral states without pet data.

The resolver applies the owner-controlled preferences from `pet_public_preferences` before it creates a public ViewModel. Missing preferences are treated as all-private, and `public_profile_enabled` is a global hard stop. Unauthorized fields are omitted entirely rather than returned as `null`.

Photos are resolved through a short-lived signed URL only when `show_photo` is enabled. Storage paths, buckets and permanent URLs are never returned. Medical conditions, medications and special instructions have independent consent checks; the resolver does not load encrypted medical data unless at least one related consent is enabled. Primary and emergency contacts are independently filtered.

Migration `0007_customer_privacy_controls` is applied in the confirmed development environment. The resolver retains its explicit absent-table safeguard so an incomplete environment defaults to an empty private preference set rather than failing or exposing data.

The reviewed migration order is 0006 followed by 0007. Migration 0006 does not grant public access to order data and has no effect on this resolver. Review [MIGRATIONS.md](./MIGRATIONS.md) before applying either migration.

The process-local rate limiter is a protective baseline only. A shared edge-backed limiter is required before multi-instance public launch.
