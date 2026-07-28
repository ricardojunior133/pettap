# Sprint 25N.3 — NFC module provenance

## Source handling

Every source candidate was read directly from the original workspace and remains
untracked there. It has no canonical Git commit. This sprint therefore assigns
the copied code a new local baseline commit only after review; compilation is
not treated as proof of production readiness.

| Destination | Source | Source SHA-256 | Destination SHA-256 | Change | Functional owner | Confidence |
| --- | --- | --- | --- | --- | --- | --- |
| `features/nfc/domain/tag-status.ts` | `features/tags/types/tag.ts` plus migration `0000_chilly_nebula.sql` | `6ED5AE0DBA4A44BA1C002FC60394D82017D3A19E7896E429223E44E4E2AD8A44` | `44EC85AA504A851CAE620333B0DF3BC8BCAFF9D4E24B291221FE713BDC6F2484` | Reconciled: removes the internal-ID-bearing `PetTag` DTO and keeps only persisted statuses. | NFC domain | High |
| `features/nfc/services/public-tag-rate-limit.ts` | `features/public-tags/services/public-tag-rate-limit.ts` | `86E615134A2497C4B3A3EA7CDE54A44F9B594032F4CC851CF9179A10C35DFE50` | `46A5FDD1401A97602011344194C0480D50C96598EA4C9565C98172F5BB945DBF` | Formatting/comment only; same `public-tag` key namespace and 30/minute rule. | Public resolver foundation | Medium |

No other source was copied. In particular, no activation action, activation
repository, public resolver, public route, Lost Mode repository, medical
encryption, photo storage, contacts, preferences, or UI was imported.

## Dependencies

The status primitive is confirmed against the existing Drizzle `tagStatus` enum
and migration `0000`. The rate-limit helper depends only on the already
versioned `lib/security/rate-limit.ts`. Both stay unused by routes and Server
Actions in this sprint.

## Secret and logging review

The copied modules contain no environment variables, credentials, real tokens,
token hashes, customer data, logs, or network calls. The source review found no
safe token implementation to import. No `.env` content was accessed or copied.
