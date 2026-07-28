# Sprint 25N.4 — activation credentials report

## Classification

**BLOCKED — DATABASE CONTRACT INSUFFICIENT**

## Approved components

- Pure token generator, strict format validation, SHA-256 digest helper, and
  timing-safe verification.
- Pure lifecycle state inspection and internal issuance draft.
- Local tests for valid, invalid, expired, revoked, consumed, tag-bound, and
  plaintext-exposure cases.

## Blocked components

- Repository and service persistence.
- Atomic consumption, replay protection, concurrent winner guarantee, and
  revocation writes.
- Credential audit persistence.
- Tag activation, pet association, status transitions, and all UI/routes.

## Schema reused and gaps

`nfc_tags` and `tag_activations` were read and audited only. They do not contain
the required credential hash and lifecycle fields. No migration, journal,
snapshot, SQL, physical schema, RLS, or remote database was changed.

## Files created

- `features/nfc/activation-credentials/contract.ts`
- `tests/nfc-activation-credentials-contract.test.ts`
- this audit, contract, security review, and report

## Next safe step

Request explicit approval for a dedicated activation-credential migration and
RLS review. After it is applied and audited, implement the repository's
conditional single-use consume operation and concurrency tests. Do not connect
it to tags, pets, or UI before that review.
