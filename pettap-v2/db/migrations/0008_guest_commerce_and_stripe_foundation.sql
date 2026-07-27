CREATE TYPE "public"."checkout_status" AS ENUM('draft', 'pending_payment', 'paid', 'payment_failed', 'expired', 'cancelled');
--> statement-breakpoint
CREATE TYPE "public"."stripe_webhook_processing_status" AS ENUM('received', 'processed', 'failed');
--> statement-breakpoint

-- Guest checkout is explicit: a paid guest order can exist without inventing an
-- account or customer. Existing owner-scoped policies continue to hide these rows.
ALTER TABLE "orders" ALTER COLUMN "customer_id" DROP NOT NULL;
--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "account_id" DROP NOT NULL;
--> statement-breakpoint

CREATE TABLE "checkout_attempts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "checkout_reference" text NOT NULL,
  "account_id" uuid REFERENCES "accounts"("id") ON DELETE set null,
  "customer_id" uuid REFERENCES "customers"("id") ON DELETE set null,
  "order_id" uuid REFERENCES "orders"("id") ON DELETE set null,
  "status" "checkout_status" DEFAULT 'draft' NOT NULL,
  "currency" varchar(3) DEFAULT 'GBP' NOT NULL,
  "subtotal_minor" integer NOT NULL,
  "shipping_minor" integer NOT NULL,
  "total_minor" integer NOT NULL,
  "customer_email" text NOT NULL,
  "customer_name" text NOT NULL,
  "shipping_address_snapshot" jsonb,
  "configuration_snapshot" jsonb NOT NULL,
  "stripe_checkout_session_id" text,
  "stripe_payment_intent_id" text,
  "expires_at" timestamp with time zone,
  "paid_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "checkout_attempts_totals_nonnegative" CHECK ("subtotal_minor" >= 0 AND "shipping_minor" >= 0 AND "total_minor" = "subtotal_minor" + "shipping_minor")
);
--> statement-breakpoint

CREATE TABLE "stripe_webhook_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "stripe_event_id" text NOT NULL,
  "event_type" text NOT NULL,
  "checkout_attempt_id" uuid REFERENCES "checkout_attempts"("id") ON DELETE set null,
  "processing_status" "stripe_webhook_processing_status" DEFAULT 'received' NOT NULL,
  "processed_at" timestamp with time zone,
  "failure_code" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

CREATE UNIQUE INDEX "checkout_attempts_reference_unique" ON "checkout_attempts" USING btree ("checkout_reference");
--> statement-breakpoint
CREATE UNIQUE INDEX "checkout_attempts_order_unique" ON "checkout_attempts" USING btree ("order_id");
--> statement-breakpoint
CREATE UNIQUE INDEX "checkout_attempts_stripe_session_unique" ON "checkout_attempts" USING btree ("stripe_checkout_session_id") WHERE "stripe_checkout_session_id" IS NOT NULL;
--> statement-breakpoint
CREATE UNIQUE INDEX "checkout_attempts_stripe_payment_intent_unique" ON "checkout_attempts" USING btree ("stripe_payment_intent_id") WHERE "stripe_payment_intent_id" IS NOT NULL;
--> statement-breakpoint
CREATE INDEX "checkout_attempts_account_created_idx" ON "checkout_attempts" USING btree ("account_id", "created_at");
--> statement-breakpoint
CREATE UNIQUE INDEX "stripe_webhook_events_event_unique" ON "stripe_webhook_events" USING btree ("stripe_event_id");
--> statement-breakpoint
CREATE INDEX "stripe_webhook_events_attempt_created_idx" ON "stripe_webhook_events" USING btree ("checkout_attempt_id", "created_at");
--> statement-breakpoint

ALTER TABLE "checkout_attempts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "stripe_webhook_events" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
REVOKE ALL ON TABLE "checkout_attempts", "stripe_webhook_events" FROM anon, authenticated;
