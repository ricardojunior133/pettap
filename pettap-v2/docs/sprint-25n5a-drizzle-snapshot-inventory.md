# Sprint 25N.5A — Drizzle snapshot inventory

## Scope and safety

This inventory was produced locally in the isolated worktree. It did not use a
`DATABASE_URL`, Supabase, a remote database, or any write-capable Drizzle
command. Historical SQL migration files were read only.

## Installed toolchain

- `drizzle-kit`: `0.31.10`
- `drizzle-orm`: `0.45.2`
- dialect: PostgreSQL
- schema entrypoint: `db/schema/index.ts`
- migrations output: `db/migrations`

## Canonical migration ledger

The canonical journal has 12 continuous entries (`idx` 0 through 11), all with
`version: 7`, `dialect: postgresql`, and `breakpoints: true`.

| Index | Migration | SHA-256 |
| --- | --- | --- |
| 0000 | `0000_chilly_nebula.sql` | `672C645F6434B4CA45A803C491F75CBC86302E80A27AD647206041DC3F9F1CD9` |
| 0001 | `0001_enable_rls_and_account_isolation.sql` | `7CF313A1001BC3213BFE240297D10988A9CABBE419DB785BEFCE63CEAE085EE2` |
| 0002 | `0002_pet_photo_storage_security.sql` | `9ED322E3A6093A1DC0501CDC98834718F0B4CBAE3FCA5F98561C32396CAE946A` |
| 0003 | `0003_commerce_and_operations_foundation.sql` | `723C72EF63703F013600664BC238A96C4D41CB731C0F2DE78CD2392C00A919BF` |
| 0004 | `0004_admin_rbac_foundation.sql` | `B0528D8D0A70FCF1A314EBB8643FA179D69166A2E19DBF235FD0CB24E74715F1` |
| 0005 | `0005_admin_customer_pet_nfc_management.sql` | `0F8D981E93A605D893460D20F5D3BF650F48A6FDA658C25B20B23972A0FA6357` |
| 0006 | `0006_admin_orders_production_fulfilment.sql` | `5A21614FC886CFFB6DBA155F999EAFF4EBD0C9CD6B7422BB524E27FDBCCA0D27` |
| 0007 | `0007_customer_privacy_controls.sql` | `2DB05219E14F834F47A52C98864A26EA83F707E67E1FA481EFBEA32C17DBCAFD` |
| 0008 | `0008_guest_commerce_and_stripe_foundation.sql` | `1C42F862E44060ED9DA65A496F638C69D7E93DB88A004EF37041E214A2F1D8CB` |
| 0009 | `0009_stripe_payment_idempotency.sql` | `A08EC75273ACC7640C3FFD0B456160C1FE22293113A4824965F92FE1E0CE17DA` |
| 0010 | `0010_transactional_notification_history.sql` | `01CC156E04228C0EC69D0AB6529DA674D03DC4AF9F45929B6C51D3DADD3DA0AC` |
| 0011 | `0011_event_demo_foundation.sql` | `48F67903848C35CE9B05AD71D7C3F1E263805ABB94F2106D45EDF0B701715480` |

No `0012` SQL migration or journal entry exists.

## Snapshot metadata found

Only one snapshot exists: `db/migrations/meta/0000_snapshot.json`.

- snapshot id: `4cf37add-c747-4935-8e3f-1c069a3f7d3a`
- `prevId`: `00000000-0000-0000-0000-000000000000`
- version: `7`
- represented migration state: initial `0000` core state

There are no snapshots for journal entries 0001 through 0011. Therefore there
is no complete `prevId` snapshot chain to validate or safely extend.

## Physical objects introduced after 0000

The SQL migrations introduce, among other physical objects, commerce, admin,
customer privacy, guest checkout, transactional notification, and Event Demo
tables and enums. The sole snapshot cannot represent those additions.

## Inconsistency

The Drizzle TypeScript schema contains selected application mappings, but it is
not a complete physical representation of all SQL-defined functions, RLS
policies, storage policies, grants, triggers, and migration-only constraints.
It cannot be used as proof of the final physical state without applying the
canonical SQL to an isolated PostgreSQL instance and introspecting it.

