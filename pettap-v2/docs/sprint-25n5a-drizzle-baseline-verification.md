# Sprint 25N.5A — baseline verification procedure

## Safe checks completed

- Canonical SQL migration files 0000–0011 are present.
- The journal has twelve continuous entries, in the same filename order.
- There is no migration or journal entry numbered 0012.
- `drizzle-kit check --config drizzle.config.ts` completed successfully.
- No remote connection string was read or used.

## Evidence of incomplete metadata

Only `db/migrations/meta/0000_snapshot.json` exists. The journal nevertheless
contains 0001 through 0011. The missing snapshots make it impossible to prove
that a new migration starts from the physical state created by all canonical
SQL files.

## Commands for the future reconciliation environment

Run these only after an isolated local PostgreSQL runtime is explicitly made
available and populated exclusively from local migrations:

```powershell
# Ensure the local database is isolated and DATABASE_URL is local-only.
drizzle-kit migrate --config drizzle.config.ts

# Introspect and compare the result before any snapshot metadata changes.
drizzle-kit introspect --config drizzle.config.ts

# Verify the completed metadata chain before generating a future migration.
drizzle-kit check --config drizzle.config.ts
```

Do not run these commands against Supabase, staging, or production as part of
this sprint.

## Current result

The required `db:verify-baseline`, no-change generation, deterministic
generation, and sentinel generation checks cannot be truthfully marked as
passing until a physical local baseline and an officially supported metadata
reconciliation procedure are available.

