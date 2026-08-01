CREATE TYPE "public"."contact_request_status" AS ENUM('pending', 'delivered', 'closed', 'expired', 'cancelled');--> statement-breakpoint
CREATE TABLE "contact_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lost_report_id" uuid NOT NULL,
	"pet_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	"status" "contact_request_status" DEFAULT 'pending' NOT NULL,
	"finder_name" text NOT NULL,
	"finder_contact" text NOT NULL,
	"message" text NOT NULL,
	"actor_hash" text NOT NULL,
	"processed_at" timestamp with time zone,
	"resolved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "contact_requests_processed_after_created" CHECK ("contact_requests"."processed_at" IS NULL OR "contact_requests"."processed_at" >= "contact_requests"."created_at"),
	CONSTRAINT "contact_requests_resolved_after_created" CHECK ("contact_requests"."resolved_at" IS NULL OR "contact_requests"."resolved_at" >= "contact_requests"."created_at")
);
--> statement-breakpoint
ALTER TABLE "contact_requests" ADD CONSTRAINT "contact_requests_lost_report_id_lost_reports_id_fk" FOREIGN KEY ("lost_report_id") REFERENCES "public"."lost_reports"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contact_requests" ADD CONSTRAINT "contact_requests_pet_id_pets_id_fk" FOREIGN KEY ("pet_id") REFERENCES "public"."pets"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contact_requests" ADD CONSTRAINT "contact_requests_tag_id_nfc_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."nfc_tags"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "contact_requests_lost_report_idx" ON "contact_requests" USING btree ("lost_report_id");--> statement-breakpoint
CREATE INDEX "contact_requests_tag_status_created_idx" ON "contact_requests" USING btree ("tag_id","status","created_at");--> statement-breakpoint
CREATE INDEX "contact_requests_pet_status_created_idx" ON "contact_requests" USING btree ("pet_id","status","created_at");
--> statement-breakpoint
ALTER TABLE "contact_requests" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
REVOKE ALL ON TABLE "contact_requests" FROM PUBLIC;
--> statement-breakpoint
REVOKE ALL ON TABLE "contact_requests" FROM anon;
--> statement-breakpoint
GRANT SELECT, UPDATE ON TABLE "contact_requests" TO authenticated;
--> statement-breakpoint
CREATE POLICY "contact_requests_owner_select" ON "contact_requests" FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM "lost_reports" lr INNER JOIN "pets" p ON p."id" = lr."pet_id" WHERE lr."id" = "contact_requests"."lost_report_id" AND p."account_id" = public.current_account_id())
);
--> statement-breakpoint
CREATE POLICY "contact_requests_owner_update" ON "contact_requests" FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM "lost_reports" lr INNER JOIN "pets" p ON p."id" = lr."pet_id" WHERE lr."id" = "contact_requests"."lost_report_id" AND p."account_id" = public.current_account_id())
) WITH CHECK (
  EXISTS (SELECT 1 FROM "lost_reports" lr INNER JOIN "pets" p ON p."id" = lr."pet_id" WHERE lr."id" = "contact_requests"."lost_report_id" AND p."account_id" = public.current_account_id())
);
