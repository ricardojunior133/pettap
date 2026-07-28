# Sprint 25N.5 — activation credentials schema proposal

## Status

**BLOCKED — DRIZZLE SNAPSHOT BASELINE INCOMPLETE**

No migration is retained by this sprint. The normal Drizzle generator requires
an interactive schema-conflict decision because the isolated baseline contains
only a partial historical snapshot. Custom migration mode can allocate a file,
but its generated snapshot does not include schema changes and would cause
future duplicate-table drift. That result was discarded rather than committed.

## Audited existing contract

`nfc_tags` provides IDs, public IDs, optional ownership/pet links, status,
suspension data, timestamps, and indexes. `tag_activations` provides tag/account
FKs, a status, timestamps, and an account index. Neither has credential hash,
expiry, consumption, revocation, or a usable-credential constraint.

## Required future table

Once the snapshot baseline is reconciled, create a dedicated
`nfc_activation_credentials` table with:

- UUID primary key and restrictive FK to `nfc_tags.id`;
- `credential_hash` only, constrained to exactly 64 lowercase SHA-256 hex
  characters and uniquely indexed;
- required `expires_at`, nullable `consumed_at` and `revoked_at`, and timestamp;
- tag index plus a partial unique index for one non-consumed/non-revoked
  credential per tag;
- RLS enabled with no browser-readable policy and explicit role revocations.

No token, token fragment, secret, arbitrary payload, or customer data belongs in
this table.
