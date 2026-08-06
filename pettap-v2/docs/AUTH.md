# Authentication

## Summary

PetTap uses Supabase Auth for email/password registration, sign-in, email confirmation and session management. The public Coming Soon website remains unchanged; these flows are available only to the private application while the platform is in development.

## Flow

1. A visitor registers with a name, email and password.
2. Supabase creates the Auth user and, when email confirmation is enabled, sends the confirmation email.
3. `/auth/callback` exchanges the confirmation code for a secure cookie session.
4. The server bootstraps `accounts` and `profiles` using the Auth user UUID.
5. `/dashboard` reads the verified server-side user and its PostgreSQL profile.

Login uses the same server-side bootstrap to safely recover accounts created before profile synchronization was available. Logout clears the Supabase session through a Server Action.

## Security notes

- Sessions are managed by `@supabase/ssr` cookies, not custom localStorage.
- The service-role key is server-only and is not used for normal authentication.
- The UUID for `accounts` and `profiles` always comes from the authenticated Supabase user, never from form input.
- The root proxy refreshes sessions only for auth and dashboard routes during development. In production, Coming Soon mode continues to block private routes.

## Required Supabase configuration

Enable Email/Password authentication and add the allowed callback URLs for local development and the intended private deployment environment. Configure the email confirmation template to use the supplied redirect URL.

## Notes

Password-reset UI is intentionally deferred. RLS is documented in `docs/RLS.md` and must be applied before any browser client directly accesses application tables.
