# Sprint 25F — Migration Byte Reconciliation

## Scope and safeguards

This sprint reconciled only two local migration files in the isolated baseline
worktree. No migration command, SQL write, database change, deployment, push, or
workspace-original modification was performed.

## Canonical sources

| Migration | Canonical original path | Bytes | SHA-256 | Encoding/BOM | Line endings | Final newline |
| --- | --- | ---: | --- | --- | --- | --- |
| `0001` | `C:\Users\ricar\pettap\pettap-v2\db\migrations\0001_enable_rls_and_account_isolation.sql` | 19,057 | `7cf313a1001bc3213bfe240297d10988a9cabbe419db785befce63ceae085ee2` | UTF-8, no BOM | LF | yes |
| `0003` | `C:\Users\ricar\pettap\pettap-v2\db\migrations\0003_commerce_and_operations_foundation.sql` | 14,390 | `723c72ef63703f013600664bc238a96c4d41cb731c0f2de78cd2392c00a919bf` | UTF-8, no BOM | LF | yes |

These hashes match the remote Drizzle ledger observed during Sprint 25E.

## Cause

The baseline files had two additional trailing newline bytes each. Their content
was otherwise equivalent, but Drizzle hashes the exact migration byte stream.

| Migration | Before bytes | Before SHA-256 |
| --- | ---: | --- |
| `0001` | 19,059 | `652d312d389a6212c3193acc40fec3b3267634b4dc6181d0cc8ae41826b99517` |
| `0003` | 14,392 | `e3907e6efe640c0eac0b4bfb7309ed207e2d56f3945672a370c92bffc712739b` |

## Reconciliation

The two files were replaced by direct binary copies of their canonical original
counterparts. No SQL was regenerated, reformatted, or manually reconstructed.
The root `.gitattributes` explicitly disables Git text conversion for these two
canonical SQL files so a future Windows checkout cannot alter their byte hashes.

| Migration | Baseline bytes after | Baseline SHA-256 after | Byte comparison |
| --- | ---: | --- | --- |
| `0001` | 19,057 | `7cf313a1001bc3213bfe240297d10988a9cabbe419db785befce63ceae085ee2` | identical |
| `0003` | 14,390 | `723c72ef63703f013600664bc238a96c4d41cb731c0f2de78cd2392c00a919bf` | identical |

## Drizzle metadata

`db/migrations/meta/_journal.json` contains exactly one entry for each imported
migration in the correct isolated-baseline order:

1. `0000_chilly_nebula`
2. `0001_enable_rls_and_account_isolation`
3. `0003_commerce_and_operations_foundation`

No duplicate migration file or duplicate journal tag was found. No migration was
renumbered. The isolated baseline did not contain local source files for the
later remote entries `0002` and `0004`–`0010`; none was removed in this sprint.

## Structural safety

The Commerce schema and the existing structural tests remain unchanged apart from
the canonical-byte assertions. No functional SQL statement changed.

## Validation

- Added automated checks for the canonical SHA-256 values, unique local migration
  filenames, unique journal tags, and retained Commerce schema structure.
- Ran lint, TypeScript, tests, and production build locally.

## Remote safety confirmation

- Remote migrations executed: no
- Remote database writes: no
- Remote ledger edited: no
- Deploy/push: no
- Workspace original edited: no
