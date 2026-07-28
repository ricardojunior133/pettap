# Sprint 25N.5 — activation credentials security review

## Existing approved contract

Sprint 25N.4's server-only pure contract remains the only approved credential
implementation. It generates 32 random bytes, uses a `ptac_` base64url format,
hashes with SHA-256, compares fixed-length digest buffers with
`timingSafeEqual`, and exposes generic invalid results.

Its plaintext token exists only in an in-memory internal draft. It has no
repository, route, Server Action, DTO, logger, cookie, or database persistence.

## Persistence requirements not yet implemented

A future repository must atomically consume with a single conditional update:
matching tag and hash, not expired, not consumed, and not revoked. Issuance must
revoke prior usable credentials under a tag lock before inserting a replacement.
RLS must deny `PUBLIC`, `anon`, and `authenticated` direct access.

No token/hash persistence, no tag status change, no pet association, and no
customer-facing activation were added in this sprint.
