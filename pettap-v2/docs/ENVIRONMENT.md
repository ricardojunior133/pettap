# Environment

Required server values: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_CONTACT_EMAIL`. `lib/backend/env.ts` parses these only when a backend client is requested, allowing the Coming Soon build to remain safe before Supabase is provisioned. Never expose the service role key to the browser.
