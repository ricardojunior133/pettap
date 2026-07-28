# Sprint 25N.4 — activation credentials security review

## Approved locally

- Cryptographically secure random token generation.
- Strict token-format validation.
- Hash-only persistence shape.
- Timing-safe digest comparison with generic failures.
- Pure lifecycle inspection for valid, expired, consumed, revoked, and invalid
  states.
- Bound-tag check in the internal contract.

## Not approved

- Credential persistence.
- Atomic consumption and concurrency/replay guarantees.
- Credential revocation persistence.
- Issuance audit records.
- Any activation, pet association, status change, action, API, UI, cookie, or
  public route.

## Data exposure

The only plaintext token is the `ActivationCredentialDraft` internal value.
There is no DTO, logger, route, or Server Action in this sprint. Tests assert
that the stored shape has no plaintext-token property and that inspection
returns only a generic `{ valid: false }` on every rejected condition.

## Audit policy for the future repository

Permitted audit metadata: event kind, tag internal ID, credential internal ID,
timestamp, and authorized issuer reference. Forbidden: plaintext token, hash,
credential URL, customer contact data, pet data, SQL errors, and stack traces.
