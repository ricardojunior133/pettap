# Sprint 25N.4 — activation credentials audit

## Decision

**BLOCKED — DATABASE CONTRACT INSUFFICIENT**

The current database can identify an NFC tag and store an activation-history
row, but it cannot persist a secure activation credential lifecycle. No
repository or service that writes credentials is created in this sprint.

## Existing physical contract

`nfc_tags` provides: `id`, `public_id`, optional `account_id`, optional
`pet_id`, persisted `status`, suspension fields, timestamps, a public-ID unique
index, and account/pet/status indexes.

`tag_activations` provides: `id`, `tag_id`, `account_id`, free-form `status`,
timestamps, FKs to tag/account, and an account index. It has no credential
fields.

## Required but absent contract

No existing NFC table has a credential hash, issued timestamp, expiration,
consumed timestamp, revoked timestamp, issuance actor, hash unique index, or a
conditional consume constraint. `tag_activations.status` cannot safely replace
these fields: it is an historical event record and lacks a one-to-one credential
relationship and single-use condition.

The Event Demo session table does include a session hash and expiration, but it
belongs to a separate demo domain and is not reused for production NFC tags.

## Candidate provenance

Sprint 25N.3 confirmed the original `features/tags` activation code is
untracked, has no token/hash/expiry/consume lifecycle, and accepts an internal
pet UUID. It is reference-only and is not copied. No canonical credential
repository, service, action, cookie/session helper, or test was found for
production NFC tags.

## Required future migration proposal (not created)

A separate, explicitly approved migration must introduce a dedicated
`nfc_activation_credentials` table (or a reviewed equivalent) with at least:

- credential primary key and non-null tag FK;
- unique token hash; never the plaintext token;
- issued, expiration, consumed, and revoked timestamps;
- optional issuer/audit reference without personal data;
- indexes for tag lifecycle and valid-credential lookup;
- a transactionally conditional consume operation where `consumed_at` and
  `revoked_at` are null and `expires_at` is in the future;
- RLS/grants that keep all credential material server-only.

The migration and RLS policy review are intentionally outside this sprint.
