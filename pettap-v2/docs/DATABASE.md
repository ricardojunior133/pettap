# Database

Drizzle schema lives in `db/schema/index.ts`. The normalized tables are accounts, profiles, pets, pet_photos, medical_information, vaccinations, emergency_contacts, nfc_tags, tag_activations, lost_reports, activity_logs, notifications, audit_logs, settings, future_orders and future_products. `accounts` is the Supabase Auth user UUID. Pets belong to accounts; contacts, photos and medical records belong to pets; tags may be assigned to an account and pet.

Generate reviewed SQL with `npm run db:generate`; apply only with a configured `DATABASE_URL` and Supabase migration workflow.
