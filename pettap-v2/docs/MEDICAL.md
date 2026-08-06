# Medical Profile and Vaccinations

## Scope

The private Medical Profile is built from the existing `medical_information` and `vaccinations` tables. It is accessible only through authenticated dashboard routes and does not expose any data to the public Rescue experience.

## Medical information

`medical_information` has one row per pet (`pet_id` is its primary key). The application stores a versioned AES-256-GCM encrypted JSON payload in `encrypted_payload`; no plaintext medical field is written to the database. The current payload contains only:

- medical conditions;
- medication;
- allergies;
- special care instructions.

The server uses `MEDICAL_ENCRYPTION_KEY`, a base64-encoded 32-byte key. Keep it only in local and production server environments. Rotate it only through a planned key-rotation process, because existing encrypted data needs the current key to be read.

## Vaccinations

Each vaccination uses the existing fields: `id`, `pet_id`, `name`, `administered_at`, and optional `expires_at`. Records are sorted by administered date; expired entries receive a discreet visual status. Notifications and reminders are intentionally deferred.

## Ownership

The shared pet access helper resolves the account from the verified Supabase session and queries `pets.id` together with `pets.account_id`. Medical and vaccination repositories receive the authorized pet ID only after that check. A client never supplies an account ID, and a vaccination ID alone cannot reach a record.

## Future integration

NFC and Rescue flows must use explicit owner-selected visibility rules before any medical summary is available to a finder. Emergency contacts and Lost Mode remain separate future modules.
