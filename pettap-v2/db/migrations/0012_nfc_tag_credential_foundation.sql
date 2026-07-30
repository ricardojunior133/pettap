CREATE TYPE "public"."nfc_tag_credential_status" AS ENUM('active', 'rotated', 'revoked');--> statement-breakpoint
CREATE TABLE "nfc_tag_credentials" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tag_id" uuid NOT NULL,
	"credential_hash" text NOT NULL,
	"credential_hint" text NOT NULL,
	"status" "nfc_tag_credential_status" DEFAULT 'active' NOT NULL,
	"created_by_account_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"rotated_at" timestamp with time zone,
	"revoked_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "nfc_tag_credentials" ADD CONSTRAINT "nfc_tag_credentials_tag_id_nfc_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."nfc_tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nfc_tag_credentials" ADD CONSTRAINT "nfc_tag_credentials_created_by_account_id_accounts_id_fk" FOREIGN KEY ("created_by_account_id") REFERENCES "public"."accounts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "nfc_tag_credentials_hash_unique" ON "nfc_tag_credentials" USING btree ("credential_hash");--> statement-breakpoint
CREATE INDEX "nfc_tag_credentials_tag_idx" ON "nfc_tag_credentials" USING btree ("tag_id");--> statement-breakpoint
CREATE INDEX "nfc_tag_credentials_status_idx" ON "nfc_tag_credentials" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "nfc_tag_credentials_one_active_per_tag" ON "nfc_tag_credentials" USING btree ("tag_id") WHERE "nfc_tag_credentials"."status" = 'active';
--> statement-breakpoint
ALTER TABLE "nfc_tag_credentials" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
REVOKE ALL ON TABLE "nfc_tag_credentials" FROM PUBLIC;--> statement-breakpoint
REVOKE ALL ON TABLE "nfc_tag_credentials" FROM anon, authenticated;
