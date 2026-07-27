CREATE TYPE "public"."transactional_notification_status" AS ENUM('pending', 'sent', 'failed');
--> statement-breakpoint
CREATE TABLE "transactional_notifications" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "account_id" uuid REFERENCES "accounts"("id") ON DELETE set null,
  "order_id" uuid NOT NULL REFERENCES "orders"("id") ON DELETE restrict,
  "notification_type" text NOT NULL,
  "recipient" text NOT NULL,
  "subject" text NOT NULL,
  "payload" jsonb NOT NULL,
  "provider" text NOT NULL,
  "status" "transactional_notification_status" DEFAULT 'pending' NOT NULL,
  "provider_message_id" text,
  "error_message" text,
  "sent_at" timestamp with time zone,
  "failed_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "transactional_notifications_order_type_unique" ON "transactional_notifications" USING btree ("order_id", "notification_type");
--> statement-breakpoint
CREATE INDEX "transactional_notifications_account_created_idx" ON "transactional_notifications" USING btree ("account_id", "created_at");
--> statement-breakpoint
CREATE INDEX "transactional_notifications_status_created_idx" ON "transactional_notifications" USING btree ("status", "created_at");
--> statement-breakpoint
ALTER TABLE "transactional_notifications" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE "transactional_notifications" FROM PUBLIC;
REVOKE ALL ON TABLE "transactional_notifications" FROM anon, authenticated;
