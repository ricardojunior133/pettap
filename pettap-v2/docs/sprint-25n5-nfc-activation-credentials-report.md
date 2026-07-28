# Sprint 25N.5 — activation credentials report

## Classification

**BLOCKED — DRIZZLE SNAPSHOT BASELINE INCOMPLETE**

## What was established

- Existing NFC tables cannot store secure credential lifecycle data.
- The Sprint 25N.4 pure cryptographic contract remains valid and unchanged.
- A dedicated credential table is the correct future design; it must not alter
  `nfc_tags` or `tag_activations` directly.
- The normal generator cannot safely reconcile this isolated baseline without a
  reviewed snapshot-history decision.

## What was not created

- No retained migration, journal entry, snapshot, schema change, repository,
  service, action, API, UI, tag activation, pet association, RLS change, or
  remote database object.

## Application and delivery

No migration was applied locally or remotely. No database connection, deploy,
push, seed, or production action occurred. The original workspace was not
modified.

## Next exact step

Run a dedicated Drizzle history reconciliation for the isolated baseline. It
must establish a full, reviewable snapshot chain before another attempt at
normal generation of `nfc_activation_credentials`. Only after that migration is
locally applied may database-level RLS, FK, hash constraint, partial-index, and
concurrent-consume tests be claimed.
