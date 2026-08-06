ALTER TABLE "nfc_tags" ADD COLUMN "suspended_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "nfc_tags" ADD COLUMN "suspended_by_account_id" uuid REFERENCES "accounts"("id") ON DELETE set null;
--> statement-breakpoint
ALTER TABLE "nfc_tags" ADD COLUMN "suspension_reason_code" text;
--> statement-breakpoint
ALTER TABLE "nfc_tags" ADD COLUMN "suspension_reason" text;
--> statement-breakpoint
CREATE INDEX "nfc_tags_status_idx" ON "nfc_tags" USING btree ("status");
--> statement-breakpoint
CREATE INDEX "profiles_display_name_lower_idx" ON "profiles" USING btree (lower("display_name"));
--> statement-breakpoint
CREATE INDEX "pets_name_lower_idx" ON "pets" USING btree (lower("name"));
--> statement-breakpoint
CREATE TABLE "nfc_tag_status_history" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tag_id" uuid NOT NULL REFERENCES "nfc_tags"("id") ON DELETE restrict,
  "previous_status" "tag_status",
  "new_status" "tag_status" NOT NULL,
  "reason_code" text,
  "reason" text,
  "changed_by_account_id" uuid REFERENCES "accounts"("id") ON DELETE set null,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "nfc_tag_status_history_tag_created_idx" ON "nfc_tag_status_history" USING btree ("tag_id", "created_at");
--> statement-breakpoint
ALTER TABLE "nfc_tag_status_history" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE "nfc_tag_status_history" FROM PUBLIC;
REVOKE ALL ON TABLE "nfc_tag_status_history" FROM anon, authenticated;
--> statement-breakpoint

INSERT INTO "admin_permissions" ("code", "name", "description") VALUES
  ('customers.support_view', 'View customer support summary', 'View minimum support-safe customer data.'),
  ('pets.support_view', 'View pet support summary', 'View minimum support-safe pet data.'),
  ('tags.suspend', 'Suspend NFC tags', 'Suspend an active or unassigned NFC tag with a reason.'),
  ('tags.reactivate', 'Reactivate NFC tags', 'Reactivate an eligible suspended NFC tag with a reason.'),
  ('tags.reassign', 'Reassign NFC tags', 'Perform exceptional, audited NFC tag association corrections.'),
  ('lost_reports.read', 'View lost reports', 'View Lost Mode status summaries.'),
  ('activity.read', 'View activity', 'View sanitized operational activity timelines.')
ON CONFLICT ("code") DO NOTHING;
--> statement-breakpoint
INSERT INTO "admin_role_permissions" ("role_id", "permission_id")
SELECT role_record.id, permission_record.id
FROM (VALUES
  ('support', 'customers.support_view'), ('support', 'pets.support_view'), ('support', 'lost_reports.read'), ('support', 'activity.read'),
  ('operations', 'customers.support_view'), ('operations', 'pets.support_view'), ('operations', 'lost_reports.read'), ('operations', 'activity.read'), ('operations', 'tags.suspend'), ('operations', 'tags.reactivate'),
  ('admin', 'customers.support_view'), ('admin', 'pets.support_view'), ('admin', 'lost_reports.read'), ('admin', 'activity.read'), ('admin', 'tags.suspend'), ('admin', 'tags.reactivate'),
  ('super_admin', 'customers.support_view'), ('super_admin', 'pets.support_view'), ('super_admin', 'lost_reports.read'), ('super_admin', 'activity.read'), ('super_admin', 'tags.suspend'), ('super_admin', 'tags.reactivate'), ('super_admin', 'tags.reassign')
) AS mapping(role_code, permission_code)
JOIN "admin_roles" AS role_record ON role_record.code = mapping.role_code
JOIN "admin_permissions" AS permission_record ON permission_record.code = mapping.permission_code
ON CONFLICT DO NOTHING;
