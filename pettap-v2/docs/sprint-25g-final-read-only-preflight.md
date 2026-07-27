# Sprint 25G — Final Read-Only Ledger Preflight

## Scope

This preflight used only local file inspection and remote PostgreSQL `SELECT`/
catalogue queries. No migration, write query, deploy, push, or workspace-original
change was performed.

## Audited worktree

- Worktree: `C:\Users\ricar\premium-account-portal\pettap-v2`
- Branch: `feature/premium-account-portal`
- HEAD: `59cc9bddf4958752b7a81adbfdd905ceb1d53fef`
- Working tree before this documentation: clean.
- Sprint 25F commits were present: `e75c2fd`, `0aa6d24`, and `59cc9bd`.
- No duplicate local SQL filename for `0001` or `0003` was found.

## Local canonical migration bytes

| Migration | Bytes | SHA-256 | BOM | Line endings | Final newline |
| --- | ---: | --- | --- | --- | --- |
| `0001` | 19,057 | `7cf313a1001bc3213bfe240297d10988a9cabbe419db785befce63ceae085ee2` | none | LF | yes |
| `0003` | 14,390 | `723c72ef63703f013600664bc238a96c4d41cb731c0f2de78cd2392c00a919bf` | none | LF | yes |

Both values match the canonical values specified for this sprint.

## Remote Drizzle ledger

The remote `drizzle.__drizzle_migrations` ledger has 12 unique, timestamp-ordered
entries (`id` 1 through 12), representing the original history from `0000` through
`0011`. Relevant positions are:

| Migration | Remote ledger id | Remote hash | Local hash | Result |
| --- | ---: | --- | --- | --- |
| `0000` | 1 | `672c645f…` | `793591d0…` | **Divergent local bytes** |
| `0001` | 2 | `7cf313a1…` | `7cf313a1…` | MATCH |
| `0002` | 3 | `9ed322e3…` | not in baseline | Missing local history |
| `0003` | 4 | `723c72ef…` | `723c72ef…` | MATCH |
| `0004`–`0010` | 5–11 | present | not in baseline | Missing local history |
| `0011` | 12 | `48f67903…` | `a9aeae57…` | **Divergent local bytes** |

`0001` and `0003` appear exactly once remotely and locally. Their local journal
entries are unique and ordered after `0000`. The remote ledger itself is
consistent: no duplicate hash or anomalous position was observed.

## Commerce schema revalidation

The remote database contains all expected `0003` Commerce objects:

- 12 Commerce tables; none missing.
- Nine Commerce enums with expected values; none mismatched.
- Expected primary, foreign-key, unique, and check constraints (14 FKs, 12 PKs,
  six unique constraints, six checks in the Commerce set).
- All nine expected operational indexes.
- RLS enabled on all 12 tables.
- All ten expected owner-scoped policies present, with no permissive Commerce
  `USING (true)` predicate observed.
- `public.current_account_id()` exists and is `SECURITY DEFINER`.
- No Commerce-table trigger exists.

The nullable `orders.account_id` and `orders.customer_id` columns are a
compatible later Guest Checkout evolution. They are not a destructive conflict
with the initial `0003` foundation.

## Risk assessment

### A. `0001` and `0003`

Safe to consider reconciled. Their local bytes and hashes exactly match the
remote ledger, so there is no known risk of reapplying either of these two
migrations because of their own hashes.

### B. Global `db:migrate`

**Not safe and not authorised.** The isolated baseline also tracks `0000` and
`0011` with hashes that do not match the remote ledger, and it lacks local source
history for remote entries `0002` and `0004`–`0010`. The local journal is a valid
subset for this baseline, but it is not a complete representation of the remote
ledger. A global migration run could still be unsafe.

### C. Read-only customer-order integration

The remote Commerce schema is usable for future server-side, owner-scoped,
read-only order queries. That future work must not run a migrator and must retain
the existing `account_id` ownership predicate. This conclusion does not authorise
any route connection in Sprint 25G.

## Classification

**CONFLICT** — although `0001` and `0003` are MATCH and Commerce is structurally
compatible, other local tracked migrations (`0000` and `0011`) have byte/hash
differences from the remote ledger and the isolated baseline lacks several
intervening remote migration sources.

## Recommended next sprint

Before Customer Order Read Integration, run a narrowly scoped migration-history
reconciliation sprint that:

1. reconciles canonical bytes for local `0000` and `0011`;
2. imports and validates the missing remote migration history `0002` and
   `0004`–`0010` without applying it;
3. makes the local journal/meta history consistent with the full remote ledger;
4. repeats this read-only ledger preflight.

Only then should a subsequent sprint connect owner-scoped read-only orders.

## Commands performed

- Local Git/status, filename, byte, hash, and metadata inspection.
- `SELECT id, hash, created_at FROM drizzle.__drizzle_migrations`.
- Read-only PostgreSQL catalogue queries for Commerce tables, enums, constraints,
  indexes, policies, RLS flags, `current_account_id()`, and triggers.

No remote write occurred.
