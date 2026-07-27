CREATE TABLE "order_admin_notes" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "order_id" uuid NOT NULL REFERENCES "orders"("id") ON DELETE restrict,
  "actor_account_id" uuid NOT NULL REFERENCES "accounts"("id") ON DELETE restrict,
  "body" text NOT NULL CHECK (char_length("body") BETWEEN 1 AND 2000),
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "order_admin_notes_order_created_idx" ON "order_admin_notes" USING btree ("order_id", "created_at");
--> statement-breakpoint
ALTER TABLE "order_admin_notes" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE "order_admin_notes" FROM PUBLIC;
REVOKE ALL ON TABLE "order_admin_notes" FROM anon, authenticated;
--> statement-breakpoint
INSERT INTO "admin_permissions" ("code", "name", "description") VALUES
  ('orders.update_status', 'Update order status', 'Transition eligible order states.'),
  ('orders.add_internal_note', 'Add internal order notes', 'Add support-safe internal operational notes.'),
  ('production.read', 'View production queue', 'Read eligible production work.'),
  ('production.update', 'Update production work', 'Update permitted production states.'),
  ('fulfilments.create', 'Create fulfilments', 'Create fulfilments for eligible orders.'),
  ('fulfilments.update', 'Update fulfilments', 'Update permitted fulfilment details.'),
  ('fulfilments.dispatch', 'Dispatch fulfilments', 'Mark eligible fulfilments as shipped.')
ON CONFLICT ("code") DO NOTHING;
--> statement-breakpoint
INSERT INTO "admin_role_permissions" ("role_id", "permission_id")
SELECT role_record.id, permission_record.id
FROM (VALUES
  ('support', 'orders.read'),
  ('operations', 'orders.read'), ('operations', 'orders.update_status'), ('operations', 'orders.add_internal_note'), ('operations', 'production.read'), ('operations', 'production.update'), ('operations', 'fulfilments.read'), ('operations', 'fulfilments.create'), ('operations', 'fulfilments.update'), ('operations', 'fulfilments.dispatch'),
  ('admin', 'orders.read'), ('admin', 'orders.update_status'), ('admin', 'orders.add_internal_note'), ('admin', 'production.read'), ('admin', 'production.update'), ('admin', 'fulfilments.read'), ('admin', 'fulfilments.create'), ('admin', 'fulfilments.update'), ('admin', 'fulfilments.dispatch'),
  ('super_admin', 'orders.read'), ('super_admin', 'orders.update_status'), ('super_admin', 'orders.add_internal_note'), ('super_admin', 'production.read'), ('super_admin', 'production.update'), ('super_admin', 'fulfilments.read'), ('super_admin', 'fulfilments.create'), ('super_admin', 'fulfilments.update'), ('super_admin', 'fulfilments.dispatch')
) AS mapping(role_code, permission_code)
JOIN "admin_roles" AS role_record ON role_record.code = mapping.role_code
JOIN "admin_permissions" AS permission_record ON permission_record.code = mapping.permission_code
ON CONFLICT DO NOTHING;
