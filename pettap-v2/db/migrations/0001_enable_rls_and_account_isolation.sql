-- PetTap account isolation. This migration is intentionally limited to database
-- security: it does not change the application schema or expose any public data.

-- Helper functions -------------------------------------------------------------
-- The application bootstrap creates accounts.id from auth.uid(). Resolving that
-- mapping in a tightly-scoped SECURITY DEFINER function prevents policy recursion
-- once accounts itself is protected by RLS.
CREATE OR REPLACE FUNCTION public.current_account_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT a.id
  FROM public.accounts AS a
  WHERE a.id = auth.uid()
  LIMIT 1;
$$;
--> statement-breakpoint
REVOKE ALL ON FUNCTION public.current_account_id() FROM PUBLIC;
--> statement-breakpoint
GRANT EXECUTE ON FUNCTION public.current_account_id() TO authenticated;
--> statement-breakpoint

-- Grants and revokes -----------------------------------------------------------
-- Supabase Data API roles receive only the operations explicitly granted below.
-- Direct server-side Drizzle access uses the database owner and must continue to
-- apply account filters in repositories; this migration does not make it RLS-aware.
REVOKE ALL ON TABLE public.accounts, public.profiles, public.pets, public.pet_photos,
  public.medical_information, public.vaccinations, public.emergency_contacts,
  public.nfc_tags, public.tag_activations, public.lost_reports, public.activity_logs,
  public.notifications, public.audit_logs, public.settings, public.future_orders,
  public.future_products FROM PUBLIC;
--> statement-breakpoint
REVOKE ALL ON TABLE public.accounts, public.profiles, public.pets, public.pet_photos,
  public.medical_information, public.vaccinations, public.emergency_contacts,
  public.nfc_tags, public.tag_activations, public.lost_reports, public.activity_logs,
  public.notifications, public.audit_logs, public.settings, public.future_orders,
  public.future_products FROM anon, authenticated;
--> statement-breakpoint

-- Policy lookups traverse pet_id. These indexes are not present in the base
-- migration and keep owner-scoped policy checks efficient as data grows.
CREATE INDEX IF NOT EXISTS pet_photos_pet_id_idx ON public.pet_photos (pet_id);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS vaccinations_pet_id_idx ON public.vaccinations (pet_id);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS emergency_contacts_pet_id_idx ON public.emergency_contacts (pet_id);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS lost_reports_pet_id_idx ON public.lost_reports (pet_id);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS tag_activations_account_id_idx ON public.tag_activations (account_id);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS activity_logs_account_id_idx ON public.activity_logs (account_id);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS notifications_account_id_idx ON public.notifications (account_id);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS audit_logs_account_id_idx ON public.audit_logs (account_id);
--> statement-breakpoint

-- Enable RLS on every application table. FORCE is deliberately not used: the
-- server's direct PostgreSQL role is a legitimate internal path and remains
-- separately protected by repository account scoping.
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE public.pet_photos ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE public.medical_information ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE public.vaccinations ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE public.nfc_tags ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE public.tag_activations ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE public.lost_reports ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE public.future_orders ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE public.future_products ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint

-- Accounts ---------------------------------------------------------------------
GRANT SELECT ON TABLE public.accounts TO authenticated;
--> statement-breakpoint
DROP POLICY IF EXISTS accounts_select_own_account ON public.accounts;
--> statement-breakpoint
CREATE POLICY accounts_select_own_account ON public.accounts
  FOR SELECT TO authenticated
  USING (id = (SELECT public.current_account_id()));
--> statement-breakpoint

-- Profiles ---------------------------------------------------------------------
GRANT SELECT, UPDATE ON TABLE public.profiles TO authenticated;
--> statement-breakpoint
DROP POLICY IF EXISTS profiles_select_own_account ON public.profiles;
--> statement-breakpoint
CREATE POLICY profiles_select_own_account ON public.profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid() AND account_id = (SELECT public.current_account_id()));
--> statement-breakpoint
DROP POLICY IF EXISTS profiles_update_own_account ON public.profiles;
--> statement-breakpoint
CREATE POLICY profiles_update_own_account ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid() AND account_id = (SELECT public.current_account_id()))
  WITH CHECK (id = auth.uid() AND account_id = (SELECT public.current_account_id()));
--> statement-breakpoint

-- Pets -------------------------------------------------------------------------
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.pets TO authenticated;
--> statement-breakpoint
DROP POLICY IF EXISTS pets_select_own_account ON public.pets;
--> statement-breakpoint
CREATE POLICY pets_select_own_account ON public.pets
  FOR SELECT TO authenticated
  USING (account_id = (SELECT public.current_account_id()));
--> statement-breakpoint
DROP POLICY IF EXISTS pets_insert_own_account ON public.pets;
--> statement-breakpoint
CREATE POLICY pets_insert_own_account ON public.pets
  FOR INSERT TO authenticated
  WITH CHECK (account_id = (SELECT public.current_account_id()));
--> statement-breakpoint
DROP POLICY IF EXISTS pets_update_own_account ON public.pets;
--> statement-breakpoint
CREATE POLICY pets_update_own_account ON public.pets
  FOR UPDATE TO authenticated
  USING (account_id = (SELECT public.current_account_id()))
  WITH CHECK (account_id = (SELECT public.current_account_id()));
--> statement-breakpoint
DROP POLICY IF EXISTS pets_delete_own_account ON public.pets;
--> statement-breakpoint
CREATE POLICY pets_delete_own_account ON public.pets
  FOR DELETE TO authenticated
  USING (account_id = (SELECT public.current_account_id()));
--> statement-breakpoint

-- Pet-owned records ------------------------------------------------------------
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.pet_photos, public.medical_information,
  public.vaccinations, public.emergency_contacts, public.lost_reports TO authenticated;
--> statement-breakpoint
DROP POLICY IF EXISTS pet_photos_select_own_pet ON public.pet_photos;
--> statement-breakpoint
CREATE POLICY pet_photos_select_own_pet ON public.pet_photos
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.pets AS p WHERE p.id = pet_photos.pet_id AND p.account_id = (SELECT public.current_account_id())));
--> statement-breakpoint
DROP POLICY IF EXISTS pet_photos_insert_own_pet ON public.pet_photos;
--> statement-breakpoint
CREATE POLICY pet_photos_insert_own_pet ON public.pet_photos
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.pets AS p WHERE p.id = pet_photos.pet_id AND p.account_id = (SELECT public.current_account_id())));
--> statement-breakpoint
DROP POLICY IF EXISTS pet_photos_update_own_pet ON public.pet_photos;
--> statement-breakpoint
CREATE POLICY pet_photos_update_own_pet ON public.pet_photos
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.pets AS p WHERE p.id = pet_photos.pet_id AND p.account_id = (SELECT public.current_account_id())))
  WITH CHECK (EXISTS (SELECT 1 FROM public.pets AS p WHERE p.id = pet_photos.pet_id AND p.account_id = (SELECT public.current_account_id())));
--> statement-breakpoint
DROP POLICY IF EXISTS pet_photos_delete_own_pet ON public.pet_photos;
--> statement-breakpoint
CREATE POLICY pet_photos_delete_own_pet ON public.pet_photos
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.pets AS p WHERE p.id = pet_photos.pet_id AND p.account_id = (SELECT public.current_account_id())));
--> statement-breakpoint
DROP POLICY IF EXISTS medical_information_select_own_pet ON public.medical_information;
--> statement-breakpoint
CREATE POLICY medical_information_select_own_pet ON public.medical_information
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.pets AS p WHERE p.id = medical_information.pet_id AND p.account_id = (SELECT public.current_account_id())));
--> statement-breakpoint
DROP POLICY IF EXISTS medical_information_insert_own_pet ON public.medical_information;
--> statement-breakpoint
CREATE POLICY medical_information_insert_own_pet ON public.medical_information
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.pets AS p WHERE p.id = medical_information.pet_id AND p.account_id = (SELECT public.current_account_id())));
--> statement-breakpoint
DROP POLICY IF EXISTS medical_information_update_own_pet ON public.medical_information;
--> statement-breakpoint
CREATE POLICY medical_information_update_own_pet ON public.medical_information
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.pets AS p WHERE p.id = medical_information.pet_id AND p.account_id = (SELECT public.current_account_id())))
  WITH CHECK (EXISTS (SELECT 1 FROM public.pets AS p WHERE p.id = medical_information.pet_id AND p.account_id = (SELECT public.current_account_id())));
--> statement-breakpoint
DROP POLICY IF EXISTS medical_information_delete_own_pet ON public.medical_information;
--> statement-breakpoint
CREATE POLICY medical_information_delete_own_pet ON public.medical_information
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.pets AS p WHERE p.id = medical_information.pet_id AND p.account_id = (SELECT public.current_account_id())));
--> statement-breakpoint
DROP POLICY IF EXISTS vaccinations_select_own_pet ON public.vaccinations;
--> statement-breakpoint
CREATE POLICY vaccinations_select_own_pet ON public.vaccinations
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.pets AS p WHERE p.id = vaccinations.pet_id AND p.account_id = (SELECT public.current_account_id())));
--> statement-breakpoint
DROP POLICY IF EXISTS vaccinations_insert_own_pet ON public.vaccinations;
--> statement-breakpoint
CREATE POLICY vaccinations_insert_own_pet ON public.vaccinations
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.pets AS p WHERE p.id = vaccinations.pet_id AND p.account_id = (SELECT public.current_account_id())));
--> statement-breakpoint
DROP POLICY IF EXISTS vaccinations_update_own_pet ON public.vaccinations;
--> statement-breakpoint
CREATE POLICY vaccinations_update_own_pet ON public.vaccinations
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.pets AS p WHERE p.id = vaccinations.pet_id AND p.account_id = (SELECT public.current_account_id())))
  WITH CHECK (EXISTS (SELECT 1 FROM public.pets AS p WHERE p.id = vaccinations.pet_id AND p.account_id = (SELECT public.current_account_id())));
--> statement-breakpoint
DROP POLICY IF EXISTS vaccinations_delete_own_pet ON public.vaccinations;
--> statement-breakpoint
CREATE POLICY vaccinations_delete_own_pet ON public.vaccinations
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.pets AS p WHERE p.id = vaccinations.pet_id AND p.account_id = (SELECT public.current_account_id())));
--> statement-breakpoint
DROP POLICY IF EXISTS emergency_contacts_select_own_pet ON public.emergency_contacts;
--> statement-breakpoint
CREATE POLICY emergency_contacts_select_own_pet ON public.emergency_contacts
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.pets AS p WHERE p.id = emergency_contacts.pet_id AND p.account_id = (SELECT public.current_account_id())));
--> statement-breakpoint
DROP POLICY IF EXISTS emergency_contacts_insert_own_pet ON public.emergency_contacts;
--> statement-breakpoint
CREATE POLICY emergency_contacts_insert_own_pet ON public.emergency_contacts
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.pets AS p WHERE p.id = emergency_contacts.pet_id AND p.account_id = (SELECT public.current_account_id())));
--> statement-breakpoint
DROP POLICY IF EXISTS emergency_contacts_update_own_pet ON public.emergency_contacts;
--> statement-breakpoint
CREATE POLICY emergency_contacts_update_own_pet ON public.emergency_contacts
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.pets AS p WHERE p.id = emergency_contacts.pet_id AND p.account_id = (SELECT public.current_account_id())))
  WITH CHECK (EXISTS (SELECT 1 FROM public.pets AS p WHERE p.id = emergency_contacts.pet_id AND p.account_id = (SELECT public.current_account_id())));
--> statement-breakpoint
DROP POLICY IF EXISTS emergency_contacts_delete_own_pet ON public.emergency_contacts;
--> statement-breakpoint
CREATE POLICY emergency_contacts_delete_own_pet ON public.emergency_contacts
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.pets AS p WHERE p.id = emergency_contacts.pet_id AND p.account_id = (SELECT public.current_account_id())));
--> statement-breakpoint
DROP POLICY IF EXISTS lost_reports_select_own_pet ON public.lost_reports;
--> statement-breakpoint
CREATE POLICY lost_reports_select_own_pet ON public.lost_reports
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.pets AS p WHERE p.id = lost_reports.pet_id AND p.account_id = (SELECT public.current_account_id())));
--> statement-breakpoint
DROP POLICY IF EXISTS lost_reports_insert_own_pet ON public.lost_reports;
--> statement-breakpoint
CREATE POLICY lost_reports_insert_own_pet ON public.lost_reports
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.pets AS p WHERE p.id = lost_reports.pet_id AND p.account_id = (SELECT public.current_account_id())));
--> statement-breakpoint
DROP POLICY IF EXISTS lost_reports_update_own_pet ON public.lost_reports;
--> statement-breakpoint
CREATE POLICY lost_reports_update_own_pet ON public.lost_reports
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.pets AS p WHERE p.id = lost_reports.pet_id AND p.account_id = (SELECT public.current_account_id())))
  WITH CHECK (EXISTS (SELECT 1 FROM public.pets AS p WHERE p.id = lost_reports.pet_id AND p.account_id = (SELECT public.current_account_id())));
--> statement-breakpoint
DROP POLICY IF EXISTS lost_reports_delete_own_pet ON public.lost_reports;
--> statement-breakpoint
CREATE POLICY lost_reports_delete_own_pet ON public.lost_reports
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.pets AS p WHERE p.id = lost_reports.pet_id AND p.account_id = (SELECT public.current_account_id())));
--> statement-breakpoint

-- NFC tags and activation history ------------------------------------------------
-- Tags are provisioned by the backend. Owners may only read their assigned tags;
-- activation and reassignment remain server-side domain operations.
GRANT SELECT ON TABLE public.nfc_tags, public.tag_activations TO authenticated;
--> statement-breakpoint
DROP POLICY IF EXISTS nfc_tags_select_own_account ON public.nfc_tags;
--> statement-breakpoint
CREATE POLICY nfc_tags_select_own_account ON public.nfc_tags
  FOR SELECT TO authenticated
  USING (account_id = (SELECT public.current_account_id()));
--> statement-breakpoint
DROP POLICY IF EXISTS tag_activations_select_own_account ON public.tag_activations;
--> statement-breakpoint
CREATE POLICY tag_activations_select_own_account ON public.tag_activations
  FOR SELECT TO authenticated
  USING (account_id = (SELECT public.current_account_id()));
--> statement-breakpoint

-- Account-owned records ---------------------------------------------------------
GRANT SELECT ON TABLE public.activity_logs, public.notifications TO authenticated;
--> statement-breakpoint
DROP POLICY IF EXISTS activity_logs_select_own_account ON public.activity_logs;
--> statement-breakpoint
CREATE POLICY activity_logs_select_own_account ON public.activity_logs
  FOR SELECT TO authenticated
  USING (account_id = (SELECT public.current_account_id()));
--> statement-breakpoint
DROP POLICY IF EXISTS notifications_select_own_account ON public.notifications;
--> statement-breakpoint
CREATE POLICY notifications_select_own_account ON public.notifications
  FOR SELECT TO authenticated
  USING (account_id = (SELECT public.current_account_id()));
--> statement-breakpoint

-- Settings are a user-managed account resource. The account primary key makes
-- ownership transfer impossible when both USING and WITH CHECK are present.
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.settings TO authenticated;
--> statement-breakpoint
DROP POLICY IF EXISTS settings_select_own_account ON public.settings;
--> statement-breakpoint
CREATE POLICY settings_select_own_account ON public.settings
  FOR SELECT TO authenticated
  USING (account_id = (SELECT public.current_account_id()));
--> statement-breakpoint
DROP POLICY IF EXISTS settings_insert_own_account ON public.settings;
--> statement-breakpoint
CREATE POLICY settings_insert_own_account ON public.settings
  FOR INSERT TO authenticated
  WITH CHECK (account_id = (SELECT public.current_account_id()));
--> statement-breakpoint
DROP POLICY IF EXISTS settings_update_own_account ON public.settings;
--> statement-breakpoint
CREATE POLICY settings_update_own_account ON public.settings
  FOR UPDATE TO authenticated
  USING (account_id = (SELECT public.current_account_id()))
  WITH CHECK (account_id = (SELECT public.current_account_id()));
--> statement-breakpoint
DROP POLICY IF EXISTS settings_delete_own_account ON public.settings;
--> statement-breakpoint
CREATE POLICY settings_delete_own_account ON public.settings
  FOR DELETE TO authenticated
  USING (account_id = (SELECT public.current_account_id()));
--> statement-breakpoint

-- Audit and future tables -------------------------------------------------------
-- There is no safe client ownership model for these placeholders yet. They remain
-- RLS-protected with no grants or policies until a dedicated domain sprint defines
-- their access model. In particular, audit logs are backend-only.


