# Sprint 25N.1 — NFC and pets schema reconciliation

This matrix maps TypeScript definitions to existing canonical migrations only.
No SQL is generated or executed by this work.

| Table | SQL column | Drizzle property | SQL type / nullable / default | Source | Security note |
| --- | --- | --- | --- | --- | --- |
| `pets` | `id` | `id` | UUID, not null, `gen_random_uuid()` | 0000 | Internal only |
| `pets` | `account_id` | `accountId` | UUID, not null, FK accounts, cascade | 0000 | Ownership predicate |
| `pets` | `name` | `name` | text, not null | 0000 | Customer-safe after owner lookup |
| `pets` | `species` | `species` | text, not null | 0000 | Not required in foundation DTO |
| `pets` | `public_id` | `publicId` | text, not null, unique | 0000 | Safe external pet identifier |
| `pets` | `public_profile_enabled` | `publicProfileEnabled` | boolean, not null, false | 0000 | Governs future public-profile CTA |
| `pets` | `archived_at` | `archivedAt` | timestamp with TZ, nullable | 0007 | Preserves archive state |
| `nfc_tags` | `id` | `id` | UUID, not null, `gen_random_uuid()` | 0000 | Internal only |
| `nfc_tags` | `public_id` | `publicId` | text, not null, unique | 0000 | Only safe customer URL identifier |
| `nfc_tags` | `account_id` | `accountId` | UUID, nullable, FK accounts, set null | 0000 | Owner-scoped repository predicate |
| `nfc_tags` | `pet_id` | `petId` | UUID, nullable, FK pets, set null | 0000 | Association resolved server-side |
| `nfc_tags` | `status` | `status` | `tag_status`, not null, `unassigned` | 0000 | Never return raw unknown values |
| `nfc_tags` | suspension fields | camelCase fields | nullable timestamp/UUID/text/text | 0005 | Present for accurate physical mapping; not in DTO |
| `tag_activations` | `id` | `id` | UUID, not null, `gen_random_uuid()` | 0000 | Internal only |
| `tag_activations` | `tag_id` | `tagId` | UUID, not null, FK tags | 0000 | Private association |
| `tag_activations` | `account_id` | `accountId` | UUID, not null, FK accounts | 0000 | Owner scope for activation date |
| `tag_activations` | `status` | `status` | text, not null | 0000 | Not exposed directly |
| all three | timestamps | `createdAt`/`updatedAt` | timestamp with TZ, not null, `now()` | 0000 | Only safe dates map to DTO |

Indexes reconciled: `pets_public_id_unique`, `pets_account_idx`,
`pets_account_archived_idx`, `pets_name_lower_idx`, `nfc_tags_public_id_unique`,
`nfc_tags_account_idx`, `nfc_tags_pet_idx`, `nfc_tags_status_idx`, and
`tag_activations_account_id_idx`.

Relationships are restricted to canonical foreign keys. A tag activation has no
direct pet foreign key, so no pet-to-activation relation was invented.
