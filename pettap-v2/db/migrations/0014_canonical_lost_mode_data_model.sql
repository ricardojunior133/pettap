ALTER TABLE "lost_reports" ALTER COLUMN "status" SET DEFAULT 'open';--> statement-breakpoint
ALTER TABLE "lost_reports" ADD COLUMN "tag_id" uuid;--> statement-breakpoint
ALTER TABLE "lost_reports" ADD COLUMN "actor_account_id" uuid;--> statement-breakpoint
ALTER TABLE "lost_reports" ADD COLUMN "opened_at" timestamp with time zone;--> statement-breakpoint
-- The original creation time is the only lossless opening-time value available
-- for legacy rows. Tag and actor remain NULL when historical attribution is
-- unknown; canonical reports are required to provide both by NOT VALID checks.
UPDATE "lost_reports" SET "opened_at" = "created_at" WHERE "opened_at" IS NULL;--> statement-breakpoint
ALTER TABLE "lost_reports" ALTER COLUMN "opened_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "lost_reports" ALTER COLUMN "opened_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "lost_reports" ADD COLUMN "closed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "lost_reports" ADD CONSTRAINT "lost_reports_tag_id_nfc_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."nfc_tags"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lost_reports" ADD CONSTRAINT "lost_reports_actor_account_id_accounts_id_fk" FOREIGN KEY ("actor_account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "lost_reports_tag_id_idx" ON "lost_reports" USING btree ("tag_id");--> statement-breakpoint
CREATE INDEX "lost_reports_actor_account_id_idx" ON "lost_reports" USING btree ("actor_account_id");--> statement-breakpoint
CREATE UNIQUE INDEX "lost_reports_one_open_per_pet_idx" ON "lost_reports" USING btree ("pet_id") WHERE "lost_reports"."status" = 'open' AND "lost_reports"."tag_id" IS NOT NULL AND "lost_reports"."actor_account_id" IS NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "lost_reports_one_open_per_tag_idx" ON "lost_reports" USING btree ("tag_id") WHERE "lost_reports"."status" = 'open' AND "lost_reports"."tag_id" IS NOT NULL AND "lost_reports"."actor_account_id" IS NOT NULL;--> statement-breakpoint
ALTER TABLE "lost_reports" ADD CONSTRAINT "lost_reports_status_open_or_closed" CHECK ("lost_reports"."status" IN ('open', 'closed')) NOT VALID;--> statement-breakpoint
ALTER TABLE "lost_reports" ADD CONSTRAINT "lost_reports_closed_at_matches_status" CHECK (("lost_reports"."status" = 'open' AND "lost_reports"."closed_at" IS NULL) OR ("lost_reports"."status" = 'closed' AND "lost_reports"."closed_at" IS NOT NULL)) NOT VALID;--> statement-breakpoint
ALTER TABLE "lost_reports" ADD CONSTRAINT "lost_reports_tag_required_for_canonical_records" CHECK ("lost_reports"."tag_id" IS NOT NULL) NOT VALID;--> statement-breakpoint
ALTER TABLE "lost_reports" ADD CONSTRAINT "lost_reports_actor_required_for_canonical_records" CHECK ("lost_reports"."actor_account_id" IS NOT NULL) NOT VALID;
