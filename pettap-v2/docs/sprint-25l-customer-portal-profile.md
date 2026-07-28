# Sprint 25L — Customer Portal Profile

## Scope

`/account/profile` now combines account details, editable public profile fields, saved addresses, supported preferences, and security status.

## Editable and protected data

Only `displayName` and optional `phone` are accepted by the strict server-side schema. Email is rendered read-only. Account IDs, customer IDs, UUIDs, email, password, and authentication data are never accepted from the browser.

Profile updates resolve the account from the authenticated server session, update only the owner's `profiles` row, and record a minimal audit event without personal data.

## Addresses

The page reuses `CustomerAddressService` and its owner-scoped repository. Address operations resolve the customer through the authenticated account, normalise GB postcodes/country code, validate a strict allowlist, and audit only safe metadata. Creation, editing, removal, and default address selection are available through server actions.

## Preferences and security

Language, timezone, and communication preferences are displayed only when present in existing user metadata. No new preference table or fallback data is introduced. Security uses existing Supabase user metadata to show email verification, account creation, and last sign-in; the password link points to the existing login flow and does not modify Auth.

No schema, migration, Checkout, Stripe, Admin, Event Demo, remote data, deployment, or push change is part of this sprint.
