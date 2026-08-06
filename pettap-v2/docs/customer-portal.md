# Customer portal

## Customer profile

`/dashboard/profile` is a private, persistent profile page. It follows `CustomerProfileRepository → CustomerProfileService → Server Action → CustomerProfileViewModel → UI`. The authenticated server session supplies the account identity; neither the browser nor the form supplies an account ID, customer ID, role, or email.

Customers can edit their display name and optional phone number. Their sign-in email is intentionally read-only, and roles, internal status, account identifiers, timestamps, metadata, and administrative fields are never included in the view model.

The current product supports `en-GB` as its preferred language. This value is stored in the existing private `settings.payload` record so the profile remains fully usable before migration `0007_customer_privacy_controls` is applied. The migration was not altered or applied by this module. Customer communication and marketing preferences are not exposed because no appropriately scoped preference model exists yet.

All string input is trimmed, phone whitespace is normalised while preserving international formats, and unsupported language values are rejected by Zod. Successful changes are audited as `profile.updated` with only changed field names and boolean flags; names, emails, phone numbers, and settings values are never written to audit metadata.

## Pet public privacy

`/dashboard/pets/[petId]/privacy` lets an owner configure the exact public rescue information for one pet. The controls are owner-scoped through `PetPublicPreferencesRepository → PetPublicPreferencesService → Server Action → ViewModel → UI` and accept only the pet ID plus the nine supported booleans.

The global public-profile switch is a hard stop: when it is off, a finder receives no pet information even if individual sharing options are selected. Every individual option defaults to private: photo, name, breed, age, medical conditions, medications, special instructions, primary contact and emergency contacts. Changes are audited as `privacy.updated` with only the pet ID, changed field names and the global-switch change flag.

Migration `0007_customer_privacy_controls` is applied in the confirmed development environment, so the privacy settings can now be persisted there. Breed and age are still not represented in the current pet model, so selecting their controls will not make unavailable data public.

## Customer addresses

`/dashboard/addresses` is a private, account-scoped address book for shipping and billing addresses. The route reads data on the server and passes only `CustomerAddressViewModel` records to the interactive UI. It never returns internal customer or account identifiers, database metadata, or timestamps.

### Architecture

Every address mutation follows the private path: `CustomerAddressRepository → CustomerAddressService → Server Action → dashboard UI`.

The repository receives the authenticated account identifier from the service, resolves the linked customer server-side, and scopes every read and mutation to that ownership relationship. Browser forms submit only address fields and, where needed, an address ID. They never submit an account ID or customer ID.

### Supported actions

- Create a shipping or billing address.
- Edit supported address fields.
- Remove an address after an explicit accessible confirmation.
- Set one address as the default.

Address values are normalised at the shared Zod boundary: country codes become uppercase, United Kingdom postcodes are spaced consistently, input is trimmed, and empty optional text values become `null`.

### Default-address and deletion behaviour

Setting a default address is transactional and clears any previous default for the same customer. It is idempotent if the selected address is already the default.

Deleting a default address is also transactional. If another address exists, the oldest remaining address (with ID as a stable tie-breaker) becomes the new default. If no address remains, the customer has no default address. Address changes never modify historical order address snapshots.

### Audit trail

The module records `address.created`, `address.updated`, `address.deleted`, and `address.default_changed`. Audit metadata is deliberately limited to safe IDs, address type, and default state; no name, phone number, postcode, or address lines are recorded.

### Test coverage and limits

The module has local service, schema, repository-contract, ownership, and UI-contract tests. The project does not currently include a browser DOM or E2E harness, so interactive UI behavior is contract-tested rather than browser-automated. No migration is required for Customer Addresses, and no migration is applied by this module.

## Customer orders

`/dashboard/orders` and `/dashboard/orders/[orderId]` are private, read-only customer order routes. They follow `CustomerOrderRepository → CustomerOrderService → ViewModel → Server Component UI`; no Server Action is needed because this phase has no customer mutation.

The repository scopes the list and detail query by the authenticated account in the database. A missing order and an order owned by someone else both resolve to the same safe not-found result. The list is ordered newest first and uses server-side pagination of twelve orders per page.

The portal reads immutable order, product-item and delivery-address snapshots. It shows customer-safe order number, statuses, totals, currency, item count, tracking, permitted personalisation and delivery address details. It deliberately excludes internal/admin notes, audit logs, customer and account IDs, payment provider data, Stripe IDs, webhook payloads, metadata, risk fields and internal costs.

Current limitation: this is read-only. Checkout, cancellation, refunds, invoices, emails, reorder actions and address changes are intentionally outside this module.

## Pending migration dependency

The customer order portal relies on the commerce foundation from migration 0003. Migration 0006 adds private administrative order notes and RBAC permission mappings only; it does not alter the customer-safe order projections or expose internal notes. Migration 0007 adds the private, owner-scoped pet sharing preferences described above. See [MIGRATIONS.md](./MIGRATIONS.md) for the reviewed application order and operational checklist.
