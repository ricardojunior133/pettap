CREATE TYPE "public"."event_demo_tag_status" AS ENUM('available', 'in_progress', 'completed', 'expired', 'disabled');
--> statement-breakpoint
CREATE TYPE "public"."event_demo_session_status" AS ENUM('started', 'profile_created', 'completed', 'expired', 'deleted');
--> statement-breakpoint
CREATE TYPE "public"."event_demo_species" AS ENUM('dog', 'cat', 'other');
--> statement-breakpoint
CREATE TYPE "public"."lead_source" AS ENUM('coming_soon', 'event_demo', 'fair', 'manual');
--> statement-breakpoint
CREATE TABLE "event_demo_tags" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "public_code" text NOT NULL,
  "internal_name" text NOT NULL,
  "status" "event_demo_tag_status" DEFAULT 'available' NOT NULL,
  "is_enabled" boolean DEFAULT true NOT NULL,
  "session_duration_minutes" integer DEFAULT 60 NOT NULL,
  "usage_count" integer DEFAULT 0 NOT NULL,
  "last_used_at" timestamp with time zone,
  "last_reset_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "event_demo_tags_session_duration_range" CHECK ("session_duration_minutes" BETWEEN 10 AND 240),
  CONSTRAINT "event_demo_tags_usage_count_nonnegative" CHECK ("usage_count" >= 0)
);
--> statement-breakpoint
CREATE TABLE "event_demo_sessions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "public_id" text NOT NULL,
  "demo_tag_id" uuid NOT NULL REFERENCES "event_demo_tags"("id") ON DELETE restrict,
  "session_token_hash" text NOT NULL,
  "status" "event_demo_session_status" DEFAULT 'started' NOT NULL,
  "expires_at" timestamp with time zone NOT NULL,
  "completed_at" timestamp with time zone,
  "deleted_at" timestamp with time zone,
  "pet_name" text,
  "species" "event_demo_species",
  "breed" text,
  "age" text,
  "personality" text,
  "owner_first_name" text,
  "contact_telephone" text,
  "contact_email" text,
  "photo_storage_path" text,
  "show_owner_first_name" boolean DEFAULT false NOT NULL,
  "show_telephone" boolean DEFAULT false NOT NULL,
  "show_email" boolean DEFAULT false NOT NULL,
  "show_breed" boolean DEFAULT false NOT NULL,
  "show_age" boolean DEFAULT false NOT NULL,
  "show_personality" boolean DEFAULT false NOT NULL,
  "demo_consent_accepted" boolean DEFAULT false NOT NULL,
  "demo_consent_version" text,
  "demo_consent_accepted_at" timestamp with time zone,
  "marketing_consent" boolean DEFAULT false NOT NULL,
  "marketing_consent_version" text,
  "marketing_consent_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leads" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "email" text NOT NULL,
  "first_name" text,
  "source" "lead_source" NOT NULL,
  "marketing_consent" boolean DEFAULT false NOT NULL,
  "consent_version" text,
  "consented_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "event_demo_tags_public_code_unique" ON "event_demo_tags" USING btree ("public_code");
--> statement-breakpoint
CREATE INDEX "event_demo_tags_status_idx" ON "event_demo_tags" USING btree ("status");
--> statement-breakpoint
CREATE INDEX "event_demo_tags_enabled_idx" ON "event_demo_tags" USING btree ("is_enabled");
--> statement-breakpoint
CREATE UNIQUE INDEX "event_demo_sessions_public_id_unique" ON "event_demo_sessions" USING btree ("public_id");
--> statement-breakpoint
CREATE INDEX "event_demo_sessions_tag_idx" ON "event_demo_sessions" USING btree ("demo_tag_id");
--> statement-breakpoint
CREATE INDEX "event_demo_sessions_status_idx" ON "event_demo_sessions" USING btree ("status");
--> statement-breakpoint
CREATE INDEX "event_demo_sessions_expires_at_idx" ON "event_demo_sessions" USING btree ("expires_at");
--> statement-breakpoint
CREATE UNIQUE INDEX "leads_email_normalized_unique" ON "leads" USING btree ("email");
--> statement-breakpoint
ALTER TABLE "event_demo_tags" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "event_demo_sessions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "leads" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE "event_demo_tags" FROM PUBLIC;
REVOKE ALL ON TABLE "event_demo_sessions" FROM PUBLIC;
REVOKE ALL ON TABLE "leads" FROM PUBLIC;
REVOKE ALL ON TABLE "event_demo_tags" FROM anon, authenticated;
REVOKE ALL ON TABLE "event_demo_sessions" FROM anon, authenticated;
REVOKE ALL ON TABLE "leads" FROM anon, authenticated;
--> statement-breakpoint
INSERT INTO "admin_permissions" ("code", "name", "description") VALUES
  ('event_demo.view', 'View Event Demo operations', 'View Event Demo tags and sessions.'),
  ('event_demo.manage', 'Manage Event Demo operations', 'Create and manage Event Demo tags and sessions.')
ON CONFLICT ("code") DO NOTHING;
--> statement-breakpoint
INSERT INTO "admin_role_permissions" ("role_id", "permission_id")
SELECT role_record.id, permission_record.id
FROM (VALUES
  ('operations', 'event_demo.view'), ('operations', 'event_demo.manage'),
  ('admin', 'event_demo.view'), ('admin', 'event_demo.manage'),
  ('super_admin', 'event_demo.view'), ('super_admin', 'event_demo.manage')
) AS mapping(role_code, permission_code)
JOIN "admin_roles" AS role_record ON role_record.code = mapping.role_code
JOIN "admin_permissions" AS permission_record ON permission_record.code = mapping.permission_code
ON CONFLICT DO NOTHING;
