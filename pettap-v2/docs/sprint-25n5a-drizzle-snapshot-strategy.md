# Sprint 25N.5A — snapshot strategy decision

## Source-of-truth order

1. Canonical SQL migrations 0000–0011.
2. The state produced by applying those exact files to an isolated PostgreSQL
   database.
3. Reconciled Drizzle TypeScript schema.
4. Drizzle snapshots.
5. Drizzle journal.

The snapshot is metadata for migration generation; it is not authoritative
evidence of policies, grants, functions, storage policies, or any other SQL
that Drizzle schema definitions cannot express.

## Strategy assessment

### Incremental rebuild

Not currently safe. The repository has only `0000_snapshot.json`; snapshots
for 0001–0011 never existed in this worktree. Reconstructing their internal
`id` and `prevId` values by hand would invent historical metadata. It would not
prove the snapshots were accepted by Drizzle when those migrations were made.

### Consolidated baseline

Not currently safe. Drizzle Kit 0.31.10 can generate a new snapshot from the
TypeScript schema, but the schema is intentionally an application mapping, not
a complete physical model of the migration SQL. A generated consolidated
snapshot would omit migration-only database objects such as policies,
functions, grants, and triggers. Treating it as the final state would hide
drift rather than reconcile it.

### Official metadata upgrade

`drizzle-kit up` is available, but it upgrades supported metadata formats; it
does not synthesize eleven missing historical snapshots from SQL. `drizzle-kit
check` succeeds because it validates the currently present migration folder,
not because it proves a complete snapshot chain exists.

## Required prerequisite

Provision an isolated local PostgreSQL runtime (Docker, Podman, or a local
PostgreSQL installation) and a sanctioned snapshot-reconciliation procedure.
It must apply the canonical SQL only locally, introspect the resulting schema,
and preserve an auditable mapping from each historical migration to metadata.

Until that prerequisite is available, creating or editing snapshots would be
unverifiable metadata fabrication. Sprint 25N.5 must remain blocked.

