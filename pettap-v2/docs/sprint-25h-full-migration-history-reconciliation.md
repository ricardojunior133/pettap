# Sprint 25H — Full Migration History Reconciliation

## Scope

Only the isolated baseline worktree was changed. The canonical sources were read
from the original workspace and copied as raw bytes. No migration, SQL write,
deployment, push, remote ledger edit, or workspace-original modification occurred.

## Cause of the prior conflict

The isolated baseline had an incomplete migration history and manually patched
copies of `0000` and `0011` whose byte streams did not match the remote Drizzle
ledger. The missing middle history also meant the local journal could not model
the remote sequence as a single continuous line.

## Canonical inventory and final matrix

Every file below exists locally, is byte-for-byte identical to the canonical
original file, and matches the remote Drizzle ledger hash and timestamp.

| # | Migration | Bytes | SHA-256 | Final state |
| ---: | --- | ---: | --- | --- |
| 0000 | `0000_chilly_nebula.sql` | 8,547 | `672c645f…` | MATCH |
| 0001 | `0001_enable_rls_and_account_isolation.sql` | 19,057 | `7cf313a1…` | MATCH |
| 0002 | `0002_pet_photo_storage_security.sql` | 3,664 | `9ed322e3…` | MATCH |
| 0003 | `0003_commerce_and_operations_foundation.sql` | 14,390 | `723c72ef…` | MATCH |
| 0004 | `0004_admin_rbac_foundation.sql` | 6,908 | `b0528d8d…` | MATCH |
| 0005 | `0005_admin_customer_pet_nfc_management.sql` | 3,520 | `0f8d981e…` | MATCH |
| 0006 | `0006_admin_orders_production_fulfilment.sql` | 2,899 | `5a21614f…` | MATCH |
| 0007 | `0007_customer_privacy_controls.sql` | 1,606 | `2db05219…` | MATCH |
| 0008 | `0008_guest_commerce_and_stripe_foundation.sql` | 3,634 | `1c42f862…` | MATCH |
| 0009 | `0009_stripe_payment_idempotency.sql` | 239 | `a08ec752…` | MATCH |
| 0010 | `0010_transactional_notification_history.sql` | 1,579 | `01cc156e…` | MATCH |
| 0011 | `0011_event_demo_foundation.sql` | 5,557 | `48f67903…` | MATCH |

All SQL files are UTF-8 without BOM and LF terminated. Eleven canonical files
contain a final newline; `0009_stripe_payment_idempotency.sql` canonically does
not, and is preserved exactly in that form.

## Files imported or replaced

- Replaced canonical-byte divergences: `0000`, `0001`, `0003`, and `0011`.
- Imported missing canonical migrations: `0002` and `0004` through `0010`.
- Replaced Drizzle metadata with the canonical `meta/_journal.json` and canonical
  `meta/0000_snapshot.json`.

The original migration source contains one snapshot (`0000_snapshot.json`), and
the baseline now has that same snapshot byte-for-byte. No snapshot was generated.

## Journal and metadata

- Journal parses successfully.
- Exactly 12 entries exist, with indices `0` through `11`.
- Tags are unique, continuous, and ordered from `0000` through `0011`.
- The local entry timestamps and hashes match the 12 remote ledger records.
- No duplicate SQL filename, duplicate tag, renumbered migration, or second
  parallel journal was found.

## Byte protection

The root `.gitattributes` disables Git text conversion for
`pettap-v2/db/migrations/*.sql`. This prevents a future LF/CRLF checkout change
from altering a Drizzle migration hash.

## Structural tests

The migration integrity test now verifies:

- exactly the 12 expected SQL files;
- all 12 canonical SHA-256 hashes;
- journal tag order and uniqueness;
- expected metadata files;
- retained Commerce schema and services.

No route, UI, Checkout, Stripe, Admin, Event Demo, or Customer Portal file was
changed by this sprint.

## Security assessment

### A. Is local history `0000`–`0011` complete?

Yes.

### B. Do all local hashes match the remote ledger?

Yes, all 12 do.

### C. Is the journal reconciled?

Yes. It is a single, complete, ordered 12-entry history matching the remote
ledger.

### D. Is there a known hash-based reapplication risk?

No. The local files now match the remote applied hashes exactly.

### E. Is it safe to create a future migration `0012`?

Yes, after a separately authorised development task and review. No migration was
created in this sprint.

### F. Is it safe to execute `db:migrate`?

The ledger/source alignment no longer presents a known reapplication risk. It is
therefore technically safe to plan a future, separately authorised migration run.
It was not authorised or executed in Sprint 25H.

### G. Is it safe to connect owner-scoped order reads?

Yes, in a later, read-only integration sprint that uses the existing server-side
ownership filters and does not run migrations.

## Quality gates

- Lint: PASS
- TypeScript: PASS
- Tests: PASS — 48 tests
- Production build: PASS

## Remote safety confirmation

- Migrations executed: no
- Remote database writes: no
- Remote ledger edits: no
- Deploy/push: no
- Workspace original edits: no

## Classification

**MATCH** — complete local migration history, byte-exact canonical files, remote
ledger alignment, valid metadata, and all quality gates passing.
