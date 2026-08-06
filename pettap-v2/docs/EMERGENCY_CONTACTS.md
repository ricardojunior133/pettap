# Emergency Contacts

## Summary

Emergency contacts are private, account-owned records. The module uses only `emergency_contacts`: `id`, `pet_id`, `name`, `relationship`, `phone`, `is_primary`, and timestamps.

## Security and behaviour

Every operation follows authenticated user → account → pet → contact. A contact ID alone is never sufficient. A maximum of five contacts is enforced by the server as a product rule, not a database constraint. Setting a primary contact clears the previous primary contact in the same database transaction.

## Current schema limitations

The schema has no priority, active/inactive, email, or public-visibility fields. Contacts therefore stay private and are never used by a public rescue page. Those controls require an explicit future schema migration and privacy review.

## Manual verification

Create, edit, set primary, delete, refresh, and try a URL from a separate account. The latter must return a generic not-found result.
