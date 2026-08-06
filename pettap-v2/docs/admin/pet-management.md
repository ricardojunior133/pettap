# Pet support management

`/admin/pets/[petId]` resolves the pet and owner server-side after `pets.read`. A valid UUID alone never authorizes access.

The page shows the pet summary, Lost Mode state, associated tags and only a medical-information-present indicator. It never decrypts or displays the underlying medical payload.

Pet photos remain in the private `pet-photos` bucket. A server-only service resolves the database-owned path and creates a short-lived signed URL only for the requested pet. Storage paths and signed URLs are not logged or returned as operational fields.
