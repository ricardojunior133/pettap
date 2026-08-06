# PetTap Row Level Security

## Summary

Sprint 13B introduces the version-controlled Row Level Security (RLS) policy set in `db/migrations/0001_enable_rls_and_account_isolation.sql`. It protects the Supabase Data API and any future user-scoped Supabase client from cross-account access.

The migration is deliberately **not applied automatically to the configured Supabase project**. It must first be applied to an isolated development or staging database, then verified with two test accounts. This keeps the public Coming Soon launch safe while the private platform remains protected by `proxy.ts`.

## Identity model

The current account bootstrap is server-side:

```text
Supabase auth.uid()
        ↓
accounts.id
        ↓
profiles.id and profiles.account_id
```

`features/owner/repositories/owner-repository.ts` creates both `accounts.id` and `profiles.id` from the authenticated user UUID. No policy uses email, a display name, or an account identifier supplied by the browser.

`public.current_account_id()` is a `STABLE`, `SECURITY DEFINER` SQL helper with no parameters. It reads only the account matching `auth.uid()`, fixes `search_path` to `public`, and is executable only by `authenticated` users. It exists to avoid policy recursion after RLS is enabled on `accounts`.

## Access model

| Resource | Anonymous | Owner | Other account | Backend |
| --- | --- | --- | --- | --- |
| Accounts | Denied | Read own | Denied | Server-only direct database path |
| Profiles | Denied | Read/update own | Denied | Server bootstrap |
| Pets | Denied | CRUD own | Denied | Server services |
| Photos, medical data, vaccinations, contacts, lost reports | Denied | CRUD through owned pet | Denied | Server services |
| NFC tags and activation history | Denied | Read assigned only | Denied | Secure activation service |
| Notifications and activity logs | Denied | Read own | Denied | Backend creates records |
| Settings | Denied | CRUD own | Denied | Server services |
| Audit logs, future orders, future products | Denied | Denied | Denied | Backend-only until a domain model exists |

There is no anonymous RLS policy. A future public rescue flow must use a server-side ViewModel containing only deliberately public fields; it must never expose medical payloads, owner identifiers, internal database IDs, or unrestricted emergency contacts.

## Direct PostgreSQL and Drizzle

`DATABASE_URL` currently connects Drizzle as the database owner. That connection does not have a Supabase request JWT and can bypass RLS. Therefore repository and service ownership checks remain mandatory. The private repositories keep their account filters and services resolve the account from the authenticated session rather than accepting it from UI input.

`createSupabaseServerClient()` is a user-scoped cookie client and respects RLS. `createSupabaseAdminClient()` is server-only and uses the service-role secret solely for internal storage operations. It must never be imported by a Client Component.

## Applying and verifying the migration

1. Point `DATABASE_URL` at an isolated development or staging Supabase project.
2. Run `npm run db:migrate`.
3. In Supabase Dashboard, open **Database → Tables → Policies** and confirm every application table has RLS enabled.
4. In SQL Editor, verify with:

```sql
select relname, relrowsecurity, relforcerowsecurity
from pg_class
where relnamespace = 'public'::regnamespace
  and relname in ('accounts', 'profiles', 'pets', 'pet_photos', 'medical_information',
    'vaccinations', 'emergency_contacts', 'nfc_tags', 'tag_activations', 'lost_reports',
    'activity_logs', 'notifications', 'audit_logs', 'settings', 'future_orders', 'future_products')
order by relname;
```

5. Run the two-account RLS integration matrix from a non-production environment. Test account A against account B for select, insert, update, delete, and ownership transfer attempts. Test anonymous access separately.

Never use a production customer database for destructive integration tests and never paste connection strings, JWTs, or service-role secrets into SQL Editor or source control.

## Known boundaries

- Supabase Storage bucket policies are not part of Sprint 13B. `pet-images` access remains a Sprint 13C blocker.
- `nfc_tags.public_id` is not an activation secret and must not be exposed as one. A secret activation code belongs to Sprint 13D.
- No public rescue policy is introduced. The current Coming Soon route protection remains unchanged.
- The migration does not use `FORCE ROW LEVEL SECURITY`; direct server data access is safeguarded by explicit repository filters and service authorization.

## Rollback

There is no compatible migration rollback convention in this repository. Do not run ad hoc rollback SQL in production. Reversal must be reviewed as a new versioned migration that removes the named policies, revokes, helper function, indexes only if unused, and disables RLS only after a security review.
