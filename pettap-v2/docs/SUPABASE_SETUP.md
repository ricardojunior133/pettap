# Supabase Setup

1. Create separate Supabase projects for development and production.
2. Add the six values listed in `.env.example` to `.env.local` locally and Vercel project settings remotely; never commit them.
3. Run `npm run db:migrate` with the target environment's `DATABASE_URL`.
4. Apply the reviewed RLS and Storage policies from the migration runbook.
5. Generate types with `supabase gen types typescript --project-id <project-ref> --schema public > types/supabase.generated.ts` and review only generated changes.
