CREATE TABLE "pet_public_preferences" (
  "pet_id" uuid PRIMARY KEY REFERENCES "pets"("id") ON DELETE cascade,
  "show_photo" boolean NOT NULL DEFAULT false,
  "show_name" boolean NOT NULL DEFAULT false,
  "show_breed" boolean NOT NULL DEFAULT false,
  "show_age" boolean NOT NULL DEFAULT false,
  "show_medical_conditions" boolean NOT NULL DEFAULT false,
  "show_medications" boolean NOT NULL DEFAULT false,
  "show_primary_contact" boolean NOT NULL DEFAULT false,
  "show_emergency_contacts" boolean NOT NULL DEFAULT false,
  "show_special_instructions" boolean NOT NULL DEFAULT false,
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "pets" ADD COLUMN "archived_at" timestamp with time zone;
--> statement-breakpoint
CREATE INDEX "pets_account_archived_idx" ON "pets" USING btree ("account_id", "archived_at");
--> statement-breakpoint
ALTER TABLE "pet_public_preferences" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE "pet_public_preferences" FROM PUBLIC;
REVOKE ALL ON TABLE "pet_public_preferences" FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE "pet_public_preferences" TO authenticated;
--> statement-breakpoint
CREATE POLICY "pet_public_preferences_owner" ON "pet_public_preferences" FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM "pets" WHERE "pets"."id" = "pet_public_preferences"."pet_id" AND "pets"."account_id" = (SELECT public.current_account_id())))
WITH CHECK (EXISTS (SELECT 1 FROM "pets" WHERE "pets"."id" = "pet_public_preferences"."pet_id" AND "pets"."account_id" = (SELECT public.current_account_id())));
