CREATE TYPE "public"."product_status" AS ENUM('draft', 'active', 'archived');
--> statement-breakpoint
CREATE TYPE "public"."product_type" AS ENUM('nfc_tag', 'collar', 'accessory', 'bundle', 'replacement');
--> statement-breakpoint
CREATE TYPE "public"."variant_status" AS ENUM('draft', 'active', 'archived');
--> statement-breakpoint
CREATE TYPE "public"."price_status" AS ENUM('draft', 'active', 'archived');
--> statement-breakpoint
CREATE TYPE "public"."address_type" AS ENUM('shipping', 'billing');
--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('draft', 'pending_payment', 'paid', 'in_production', 'ready_to_ship', 'shipped', 'completed', 'cancelled', 'refunded');
--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('unpaid', 'pending', 'paid', 'partially_refunded', 'refunded', 'failed', 'cancelled');
--> statement-breakpoint
CREATE TYPE "public"."fulfilment_status" AS ENUM('unfulfilled', 'queued', 'in_production', 'ready', 'shipped', 'delivered', 'cancelled');
--> statement-breakpoint
CREATE TYPE "public"."production_status" AS ENUM('not_started', 'queued', 'printing', 'quality_check', 'completed', 'failed', 'cancelled');
--> statement-breakpoint

CREATE TABLE "products" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" text NOT NULL,
  "slug" text NOT NULL,
  "description" text,
  "status" "product_status" DEFAULT 'draft' NOT NULL,
  "product_type" "product_type" DEFAULT 'nfc_tag' NOT NULL,
  "is_personalisable" boolean DEFAULT true NOT NULL,
  "archived_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "products_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "product_variants" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "product_id" uuid NOT NULL REFERENCES "products"("id") ON DELETE restrict,
  "sku" text NOT NULL,
  "name" text NOT NULL,
  "status" "variant_status" DEFAULT 'draft' NOT NULL,
  "shape" text NOT NULL,
  "size" text NOT NULL,
  "material" text NOT NULL,
  "finish" text NOT NULL,
  "track_inventory" boolean DEFAULT false NOT NULL,
  "archived_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "product_variants_sku_unique" UNIQUE("sku")
);
--> statement-breakpoint
CREATE TABLE "product_prices" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "variant_id" uuid NOT NULL REFERENCES "product_variants"("id") ON DELETE restrict,
  "currency" varchar(3) DEFAULT 'GBP' NOT NULL,
  "unit_amount_minor" integer NOT NULL CHECK ("unit_amount_minor" >= 0),
  "status" "price_status" DEFAULT 'draft' NOT NULL,
  "starts_at" timestamp with time zone,
  "ends_at" timestamp with time zone,
  "external_price_id" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventory_items" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "variant_id" uuid NOT NULL REFERENCES "product_variants"("id") ON DELETE restrict,
  "quantity_on_hand" integer DEFAULT 0 NOT NULL,
  "quantity_reserved" integer DEFAULT 0 NOT NULL,
  "reorder_level" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "inventory_items_variant_unique" UNIQUE("variant_id"),
  CONSTRAINT "inventory_items_quantities_valid" CHECK ("quantity_on_hand" >= 0 AND "quantity_reserved" >= 0 AND "quantity_reserved" <= "quantity_on_hand" AND "reorder_level" >= 0)
);
--> statement-breakpoint
CREATE TABLE "customers" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "account_id" uuid NOT NULL REFERENCES "accounts"("id") ON DELETE restrict,
  "email" text NOT NULL,
  "full_name" text NOT NULL,
  "phone" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "customers_account_unique" UNIQUE("account_id")
);
--> statement-breakpoint
CREATE TABLE "customer_addresses" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "customer_id" uuid NOT NULL REFERENCES "customers"("id") ON DELETE restrict,
  "type" "address_type" NOT NULL,
  "full_name" text NOT NULL,
  "company" text,
  "address_line_1" text NOT NULL,
  "address_line_2" text,
  "city" text NOT NULL,
  "county" text,
  "postcode" text NOT NULL,
  "country_code" varchar(2) DEFAULT 'GB' NOT NULL,
  "phone" text,
  "is_default" boolean DEFAULT false NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shipping_methods" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" text NOT NULL,
  "code" text NOT NULL,
  "country_code" varchar(2) DEFAULT 'GB' NOT NULL,
  "price_minor" integer NOT NULL,
  "currency" varchar(3) DEFAULT 'GBP' NOT NULL,
  "estimated_min_days" integer NOT NULL,
  "estimated_max_days" integer NOT NULL,
  "active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "shipping_methods_code_unique" UNIQUE("code"),
  CONSTRAINT "shipping_methods_values_valid" CHECK ("price_minor" >= 0 AND "estimated_min_days" >= 0 AND "estimated_max_days" >= "estimated_min_days")
);
--> statement-breakpoint
CREATE TABLE "orders" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "order_number" text NOT NULL,
  "customer_id" uuid NOT NULL REFERENCES "customers"("id") ON DELETE restrict,
  "account_id" uuid NOT NULL REFERENCES "accounts"("id") ON DELETE restrict,
  "status" "order_status" DEFAULT 'draft' NOT NULL,
  "payment_status" "payment_status" DEFAULT 'unpaid' NOT NULL,
  "fulfilment_status" "fulfilment_status" DEFAULT 'unfulfilled' NOT NULL,
  "currency" varchar(3) DEFAULT 'GBP' NOT NULL,
  "subtotal_minor" integer DEFAULT 0 NOT NULL,
  "discount_total_minor" integer DEFAULT 0 NOT NULL,
  "shipping_total_minor" integer DEFAULT 0 NOT NULL,
  "tax_total_minor" integer DEFAULT 0 NOT NULL,
  "grand_total_minor" integer DEFAULT 0 NOT NULL,
  "shipping_address_snapshot" jsonb,
  "billing_address_snapshot" jsonb,
  "customer_email" text NOT NULL,
  "customer_name" text NOT NULL,
  "notes" text,
  "cancelled_at" timestamp with time zone,
  "completed_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "orders_order_number_unique" UNIQUE("order_number"),
  CONSTRAINT "orders_totals_nonnegative" CHECK ("subtotal_minor" >= 0 AND "discount_total_minor" >= 0 AND "shipping_total_minor" >= 0 AND "tax_total_minor" >= 0 AND "grand_total_minor" >= 0)
);
--> statement-breakpoint
CREATE TABLE "order_items" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "order_id" uuid NOT NULL REFERENCES "orders"("id") ON DELETE restrict,
  "product_id" uuid NOT NULL REFERENCES "products"("id") ON DELETE restrict,
  "variant_id" uuid NOT NULL REFERENCES "product_variants"("id") ON DELETE restrict,
  "sku" text NOT NULL,
  "product_name" text NOT NULL,
  "variant_name" text NOT NULL,
  "quantity" integer NOT NULL,
  "unit_price_minor" integer NOT NULL,
  "line_total_minor" integer NOT NULL,
  "currency" varchar(3) DEFAULT 'GBP' NOT NULL,
  "personalisation" jsonb,
  "production_status" "production_status" DEFAULT 'not_started' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "order_items_values_valid" CHECK ("quantity" > 0 AND "unit_price_minor" >= 0 AND "line_total_minor" = "quantity" * "unit_price_minor")
);
--> statement-breakpoint
CREATE TABLE "payments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "order_id" uuid NOT NULL REFERENCES "orders"("id") ON DELETE restrict,
  "provider" text NOT NULL,
  "provider_payment_id" text,
  "status" "payment_status" DEFAULT 'unpaid' NOT NULL,
  "amount_minor" integer NOT NULL CHECK ("amount_minor" >= 0),
  "currency" varchar(3) DEFAULT 'GBP' NOT NULL,
  "paid_at" timestamp with time zone,
  "failed_at" timestamp with time zone,
  "refunded_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fulfilments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "order_id" uuid NOT NULL REFERENCES "orders"("id") ON DELETE restrict,
  "status" "fulfilment_status" DEFAULT 'unfulfilled' NOT NULL,
  "provider" text,
  "tracking_number" text,
  "tracking_url" text,
  "shipped_at" timestamp with time zone,
  "delivered_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_status_history" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "order_id" uuid NOT NULL REFERENCES "orders"("id") ON DELETE restrict,
  "previous_status" "order_status",
  "new_status" "order_status" NOT NULL,
  "changed_by_account_id" uuid REFERENCES "accounts"("id") ON DELETE set null,
  "reason" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

CREATE INDEX "product_variants_product_id_idx" ON "product_variants" USING btree ("product_id");
--> statement-breakpoint
CREATE INDEX "product_prices_variant_currency_status_idx" ON "product_prices" USING btree ("variant_id", "currency", "status");
--> statement-breakpoint
CREATE INDEX "customer_addresses_customer_id_idx" ON "customer_addresses" USING btree ("customer_id");
--> statement-breakpoint
CREATE INDEX "orders_account_created_idx" ON "orders" USING btree ("account_id", "created_at");
--> statement-breakpoint
CREATE INDEX "orders_customer_id_idx" ON "orders" USING btree ("customer_id");
--> statement-breakpoint
CREATE INDEX "order_items_order_id_idx" ON "order_items" USING btree ("order_id");
--> statement-breakpoint
CREATE INDEX "payments_order_id_idx" ON "payments" USING btree ("order_id");
--> statement-breakpoint
CREATE INDEX "fulfilments_order_id_idx" ON "fulfilments" USING btree ("order_id");
--> statement-breakpoint
CREATE INDEX "order_status_history_order_id_idx" ON "order_status_history" USING btree ("order_id");
--> statement-breakpoint

ALTER TABLE "products" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "product_variants" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "product_prices" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "inventory_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "customers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "customer_addresses" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "shipping_methods" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "orders" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "order_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "payments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "fulfilments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "order_status_history" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint

REVOKE ALL ON TABLE "products", "product_variants", "product_prices", "inventory_items", "customers", "customer_addresses", "shipping_methods", "orders", "order_items", "payments", "fulfilments", "order_status_history" FROM anon, authenticated;
GRANT SELECT ON TABLE "customers", "customer_addresses", "orders", "order_items", "fulfilments", "order_status_history" TO authenticated;
GRANT UPDATE ON TABLE "customers" TO authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE "customer_addresses" TO authenticated;
--> statement-breakpoint

CREATE POLICY "customers_select_own" ON "customers" FOR SELECT TO authenticated USING ("account_id" = (SELECT public.current_account_id()));
CREATE POLICY "customers_update_own" ON "customers" FOR UPDATE TO authenticated USING ("account_id" = (SELECT public.current_account_id())) WITH CHECK ("account_id" = (SELECT public.current_account_id()));
CREATE POLICY "customer_addresses_select_own" ON "customer_addresses" FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM "customers" WHERE "customers"."id" = "customer_addresses"."customer_id" AND "customers"."account_id" = (SELECT public.current_account_id())));
CREATE POLICY "customer_addresses_insert_own" ON "customer_addresses" FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM "customers" WHERE "customers"."id" = "customer_addresses"."customer_id" AND "customers"."account_id" = (SELECT public.current_account_id())));
CREATE POLICY "customer_addresses_update_own" ON "customer_addresses" FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM "customers" WHERE "customers"."id" = "customer_addresses"."customer_id" AND "customers"."account_id" = (SELECT public.current_account_id()))) WITH CHECK (EXISTS (SELECT 1 FROM "customers" WHERE "customers"."id" = "customer_addresses"."customer_id" AND "customers"."account_id" = (SELECT public.current_account_id())));
CREATE POLICY "customer_addresses_delete_own" ON "customer_addresses" FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM "customers" WHERE "customers"."id" = "customer_addresses"."customer_id" AND "customers"."account_id" = (SELECT public.current_account_id())));
CREATE POLICY "orders_select_own" ON "orders" FOR SELECT TO authenticated USING ("account_id" = (SELECT public.current_account_id()));
CREATE POLICY "order_items_select_own" ON "order_items" FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM "orders" WHERE "orders"."id" = "order_items"."order_id" AND "orders"."account_id" = (SELECT public.current_account_id())));
CREATE POLICY "fulfilments_select_own" ON "fulfilments" FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM "orders" WHERE "orders"."id" = "fulfilments"."order_id" AND "orders"."account_id" = (SELECT public.current_account_id())));
CREATE POLICY "order_status_history_select_own" ON "order_status_history" FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM "orders" WHERE "orders"."id" = "order_status_history"."order_id" AND "orders"."account_id" = (SELECT public.current_account_id())));


