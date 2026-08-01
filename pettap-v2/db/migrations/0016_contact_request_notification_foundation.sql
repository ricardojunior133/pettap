CREATE TYPE "public"."contact_request_notification_status" AS ENUM('pending', 'processing', 'sent', 'failed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."contact_request_notification_type" AS ENUM('finder_contact_received');--> statement-breakpoint
CREATE TABLE "contact_request_notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"contact_request_id" uuid NOT NULL,
	"type" "contact_request_notification_type" NOT NULL,
	"status" "contact_request_notification_status" DEFAULT 'pending' NOT NULL,
	"recipient_email" text NOT NULL,
	"attempt_count" integer DEFAULT 0 NOT NULL,
	"last_attempt_at" timestamp with time zone,
	"sent_at" timestamp with time zone,
	"failed_at" timestamp with time zone,
	"next_retry_at" timestamp with time zone,
	"provider" text NOT NULL,
	"provider_message_id" text,
	"safe_error_code" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "contact_request_notifications" ADD CONSTRAINT "contact_request_notifications_contact_request_id_contact_requests_id_fk" FOREIGN KEY ("contact_request_id") REFERENCES "public"."contact_requests"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "contact_request_notifications_request_type_unique" ON "contact_request_notifications" USING btree ("contact_request_id","type");--> statement-breakpoint
CREATE INDEX "contact_request_notifications_status_retry_idx" ON "contact_request_notifications" USING btree ("status","next_retry_at");--> statement-breakpoint
CREATE INDEX "contact_request_notifications_request_idx" ON "contact_request_notifications" USING btree ("contact_request_id");
--> statement-breakpoint
ALTER TABLE "contact_request_notifications" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
REVOKE ALL ON TABLE "contact_request_notifications" FROM PUBLIC;
--> statement-breakpoint
REVOKE ALL ON TABLE "contact_request_notifications" FROM anon;
--> statement-breakpoint
REVOKE ALL ON TABLE "contact_request_notifications" FROM authenticated;
--> statement-breakpoint
GRANT SELECT ON TABLE "contact_request_notifications" TO authenticated;
--> statement-breakpoint
CREATE POLICY "contact_request_notifications_owner_select" ON "contact_request_notifications" FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1
    FROM "contact_requests" cr
    INNER JOIN "pets" p ON p."id" = cr."pet_id"
    WHERE cr."id" = "contact_request_notifications"."contact_request_id"
      AND p."account_id" = public.current_account_id()
  )
);
