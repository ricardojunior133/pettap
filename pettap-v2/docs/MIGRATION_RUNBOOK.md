# Migration Runbook

Use a non-production Supabase project first. Verify the migration SQL, create a database backup, then run `npm run db:migrate` with the target `DATABASE_URL`. Do not use reset commands. Verify all 16 application tables, indexes, foreign keys and RLS policies after application. Roll forward with a corrective migration; do not edit an applied migration.
