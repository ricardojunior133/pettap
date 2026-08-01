CREATE TYPE "public"."nfc_tag_provisioning_status" AS ENUM('pending', 'issued', 'write_confirmed', 'activated', 'expired', 'cancelled', 'failed');--> statement-breakpoint
CREATE TABLE "nfc_tag_provisioning_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tag_id" uuid NOT NULL,
	"credential_id" uuid NOT NULL,
	"initiated_by_account_id" uuid NOT NULL,
	"status" "nfc_tag_provisioning_status" DEFAULT 'pending' NOT NULL,
	"challenge_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"issued_at" timestamp with time zone,
	"write_confirmed_at" timestamp with time zone,
	"activated_at" timestamp with time zone,
	"cancelled_at" timestamp with time zone,
	"failure_code" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "nfc_tag_provisioning_sessions" ADD CONSTRAINT "nfc_tag_provisioning_sessions_tag_id_nfc_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."nfc_tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nfc_tag_provisioning_sessions" ADD CONSTRAINT "nfc_tag_provisioning_sessions_credential_id_nfc_tag_credentials_id_fk" FOREIGN KEY ("credential_id") REFERENCES "public"."nfc_tag_credentials"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nfc_tag_provisioning_sessions" ADD CONSTRAINT "nfc_tag_provisioning_sessions_initiated_by_account_id_accounts_id_fk" FOREIGN KEY ("initiated_by_account_id") REFERENCES "public"."accounts"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "nfc_tag_provisioning_sessions_challenge_hash_unique" ON "nfc_tag_provisioning_sessions" USING btree ("challenge_hash");--> statement-breakpoint
CREATE INDEX "nfc_tag_provisioning_sessions_tag_idx" ON "nfc_tag_provisioning_sessions" USING btree ("tag_id");--> statement-breakpoint
CREATE INDEX "nfc_tag_provisioning_sessions_expiry_idx" ON "nfc_tag_provisioning_sessions" USING btree ("status","expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "nfc_tag_provisioning_sessions_one_open_per_tag" ON "nfc_tag_provisioning_sessions" USING btree ("tag_id") WHERE "nfc_tag_provisioning_sessions"."status" in ('pending', 'issued', 'write_confirmed');
--> statement-breakpoint
ALTER TABLE "nfc_tag_provisioning_sessions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
REVOKE ALL ON TABLE "nfc_tag_provisioning_sessions" FROM PUBLIC;--> statement-breakpoint
REVOKE ALL ON TABLE "nfc_tag_provisioning_sessions" FROM anon, authenticated;
