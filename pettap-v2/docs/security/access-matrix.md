# PetTap Database Access Matrix

## Scope

This matrix records the intended access model implemented by the Sprint 13B RLS migration. “Backend” means a server-only service or job; it is not a browser or public route.

| Table | Ownership path | Anonymous | Authenticated owner | Other account | Backend | RLS policy |
| --- | --- | --- | --- | --- | --- | --- |
| `accounts` | `accounts.id = auth.uid()` | No | Read | No | Bootstrap/read | `accounts_select_own_account` |
| `profiles` | `profiles.id = auth.uid()` and `account_id` | No | Read, update | No | Bootstrap | `profiles_*_own_account` |
| `pets` | `pets.account_id` | No | CRUD | No | CRUD after service authorization | `pets_*_own_account` |
| `pet_photos` | `pet_photos.pet_id → pets.account_id` | No | CRUD | No | Storage service and photo service | `pet_photos_owner_crud` |
| `medical_information` | `pet_id → pets.account_id` | No | CRUD | No | Medical service | `medical_information_owner_crud` |
| `vaccinations` | `pet_id → pets.account_id` | No | CRUD | No | Vaccination service | `vaccinations_owner_crud` |
| `emergency_contacts` | `pet_id → pets.account_id` | No | CRUD | No | Contact service | `emergency_contacts_owner_crud` |
| `nfc_tags` | `nfc_tags.account_id` | No | Read assigned | No | Tag provisioning/activation service | `nfc_tags_select_own_account` |
| `tag_activations` | `tag_activations.account_id` | No | Read own | No | Activation service | `tag_activations_select_own_account` |
| `lost_reports` | `pet_id → pets.account_id` | No | CRUD | No | Lost Mode service | `lost_reports_owner_crud` |
| `activity_logs` | `activity_logs.account_id` | No | Read own | No | Backend writes | `activity_logs_select_own_account` |
| `notifications` | `notifications.account_id` | No | Read own | No | Backend writes | `notifications_select_own_account` |
| `audit_logs` | `audit_logs.account_id` | No | No | No | Backend-only | none |
| `settings` | `settings.account_id` | No | CRUD | No | Settings service | `settings_owner_crud` |
| `future_orders` | nullable `account_id`, no complete domain model | No | No | No | Backend-only | none |
| `future_products` | no safe ownership/public catalog decision | No | No | No | Backend-only | none |

## Public rescue boundary

No table in this matrix is publicly readable. Public rescue access must be an explicit, narrow server-side projection in a future sprint. It cannot use a broad `anon` policy on pets, medical information, emergency contacts, NFC tags, or lost reports.
