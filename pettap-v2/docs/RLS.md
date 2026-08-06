# Row Level Security

## Current status

The account-isolation policies are versioned in `db/migrations/0001_enable_rls_and_account_isolation.sql`. They are deliberately **not applied automatically** to the configured Supabase project: apply them first to an isolated development or staging environment and complete the two-account integration matrix.

## Required next step

The actual identity mapping is `auth.uid() → accounts.id`, with `profiles.id` and `profiles.account_id` created from that same account UUID by the server bootstrap. Pet-owned rows authorize through an `exists` query against `pets.account_id`. Public lookup must use a dedicated server-side ViewModel that returns only intentional public fields; never grant broad table access to `anon`.

See [the full RLS policy documentation](./security/rls.md) and the [database access matrix](./security/access-matrix.md).
