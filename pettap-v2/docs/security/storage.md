# PetTap Private Pet Photo Storage

## Summary

Pet photos use the private Supabase Storage bucket `pet-photos`. Its source of truth is the versioned migration `db/migrations/0002_pet_photo_storage_security.sql`, not a manual dashboard-only setup.

The migration is not applied automatically to the configured remote Supabase project. Apply it first in an isolated development or staging environment after migration `0001_enable_rls_and_account_isolation.sql`.

## Bucket contract

| Setting | Value |
| --- | --- |
| Bucket | `pet-photos` |
| Public access | Disabled |
| Allowed inputs | JPEG, PNG, WebP |
| Maximum source size | 5 MB |
| Maximum photos per pet | 6 |
| Stored format | WebP |
| Signed URL lifetime | 10 minutes |

The server processes accepted images with Sharp, applies orientation, limits dimensions to 1600 px, and writes a new WebP object. Decoding rejects content that merely claims to be an image, including an HTML file renamed as an image. SVG is rejected before image processing. The generated WebP output does not retain the original EXIF payload.

## Object paths

```text
{accountId}/{petId}/{photoId}.webp
```

All IDs are UUIDs resolved or generated on the server. Browser fields and original file names cannot control the final path. PostgreSQL stores only `storage_path`; signed URLs are never persisted.

## Storage policies

`public.can_manage_pet_photo_path(object_name text)` validates the path against the authenticated account and the owner of the referenced pet. It has no account-ID argument, fixes `search_path`, uses no dynamic SQL, and is executable only by `authenticated`.

| Policy | Operation | Result |
| --- | --- | --- |
| `pet_photos_select_own_account` | Select | Own account and owned-pet paths only |
| `pet_photos_insert_own_account` | Insert | A new object in an owned-pet path only |
| `pet_photos_delete_own_account` | Delete | An owned object only |

There is no anonymous policy or object-update policy. Replacements use a new immutable path and `upsert: false`.

## Upload and delete flow

1. A Server Action validates the session and pet identifier.
2. `PhotoService` resolves ownership from the session.
3. It checks the six-photo limit and generates a UUID path.
4. `SupabaseStorageService` uses the cookie-scoped Supabase server client, so Storage policies receive the user JWT.
5. The object uploads, then a `pet_photos` row is inserted. An insert failure triggers compensating object deletion.
6. A signed URL is generated only after authorization and is valid for ten minutes.

If URL signing fails after a successful insert, the object and database record remain valid; a later request can create a new URL without re-uploading. Deletes validate the photo, pet and account before removal. A rare failed Storage deletion after the database transaction is surfaced as a safe failure and remains detectable for operational reconciliation.

## Main photo integrity

The migration adds `pet_photos_one_primary_per_pet_idx`, a partial unique index preventing more than one primary photo per pet. The repository changes primary state in a transaction and promotes the next most-recent remaining photo when the primary image is deleted.

## Public rescue boundary

No anonymous bucket access is introduced. The public rescue route remains gated by Coming Soon protection. A future rescue ViewModel may create one short-lived signed URL for an explicitly permitted primary photo, but must never expose the bucket, storage path, account ID, private gallery, or other photo IDs. The schema has no advanced public-photo consent setting yet.

## Dashboard verification

After applying the migration in development or staging:

1. Open **Storage → Buckets → pet-photos** and confirm the bucket is private, limited to 5 MB, and accepts only JPEG, PNG and WebP.
2. Open **Database → Policies → storage.objects** and confirm the three named policies.
3. Test account A and account B against each other's paths; neither must receive a signed URL, metadata, upload permission, or delete permission.
4. Test an anonymous request; it must have no bucket access.

## Remaining operational work

- Two-account Storage integration tests require Supabase local or an isolated test project and must not run against production data.
- There is no scheduled orphan reconciliation job. A future operation can add a read-only audit and explicitly confirmed cleanup flow.
- Advanced rate limiting, malware scanning, and public-photo consent remain future work.
