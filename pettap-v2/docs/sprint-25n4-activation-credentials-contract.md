# Sprint 25N.4 — activation credential domain contract

## Scope

`features/nfc/activation-credentials/contract.ts` is a pure, server-only
contract. It does not query a database, persist a draft, create an activation
history record, assign a pet, change a tag status, expose a route, or send a
response to a browser.

## Token policy

- Input entropy: 32 bytes from `node:crypto.randomBytes`.
- Format: `ptac_` followed by base64url-encoded bytes.
- Stored form: lowercase SHA-256 hex only.
- Plaintext lifetime: only the in-memory issuance draft.
- Comparison: candidate and persisted digest buffers are compared through
  `timingSafeEqual`; malformed values use a same-length dummy digest before the
  generic failure result.

High entropy makes SHA-256 suitable here without a password-style salt: this is
an opaque bearer credential, not a human password. A future migration must still
ensure the hash is unique and never returned by repositories/DTOs.

## Internal states

`valid`, `expired`, `consumed`, `revoked`, and `invalid` are the complete
credential state vocabulary. Revocation takes precedence over consumption;
consumption takes precedence over expiry. Invalid is returned only as the
generic non-valid check result, never with cause details.

## Required future repository operations

1. Issue: conditionally mint a draft only for an eligible tag and persist the
   hash with lifecycle metadata.
2. Inspect: look up the hash, verify its tag binding and state, and return a
   generic failure for every invalid condition.
3. Consume: atomically set `consumed_at` only on a valid credential. Exactly one
   concurrent transaction must win.
4. Revoke: server-only, audit-safe transition with no plaintext or hash in logs.

These are intentionally contract requirements, not implemented operations.
