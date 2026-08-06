# NFC administration

## Current tag states

The existing tag model is authoritative: `unassigned`, `active`, `suspended`, `lost` and `retired`. Sprint 14B does not invent `revoked` because it is absent from the current domain.

## Suspensions and reactivation

- `tags.suspend` can suspend an eligible tag with an explicit reason and `SUSPEND` confirmation.
- `tags.reactivate` can reactivate only a suspended tag with a reason and `REACTIVATE` confirmation.
- Retired tags cannot be suspended or reactivated through these operations.
- Status changes create append-only `nfc_tag_status_history` and `audit_logs` entries in the same transaction.

## Exceptional reassignment

`tags.reassign` is granted only to `super_admin`. It requires the destination account and pet, proves the pet belongs to that account, requires `REASSIGN` confirmation and preserves the previous relationship in safe audit metadata. It is not a customer ownership-transfer flow.

No screen, repository or ViewModel exposes activation codes, hashes, peppers, tokens or service credentials.
