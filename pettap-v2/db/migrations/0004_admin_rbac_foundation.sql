CREATE TYPE "public"."admin_membership_status" AS ENUM('active', 'disabled');
--> statement-breakpoint
CREATE TABLE "admin_roles" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "code" text NOT NULL,
  "name" text NOT NULL,
  "description" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "admin_roles_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "admin_permissions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "code" text NOT NULL,
  "name" text NOT NULL,
  "description" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "admin_permissions_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "admin_role_permissions" (
  "role_id" uuid NOT NULL REFERENCES "admin_roles"("id") ON DELETE restrict,
  "permission_id" uuid NOT NULL REFERENCES "admin_permissions"("id") ON DELETE restrict,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "admin_role_permissions_pkey" PRIMARY KEY("role_id", "permission_id")
);
--> statement-breakpoint
CREATE TABLE "admin_memberships" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "account_id" uuid NOT NULL REFERENCES "accounts"("id") ON DELETE restrict,
  "role_id" uuid NOT NULL REFERENCES "admin_roles"("id") ON DELETE restrict,
  "status" "admin_membership_status" DEFAULT 'active' NOT NULL,
  "created_by_account_id" uuid REFERENCES "accounts"("id") ON DELETE set null,
  "disabled_at" timestamp with time zone,
  "disabled_by_account_id" uuid REFERENCES "accounts"("id") ON DELETE set null,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "admin_memberships_account_unique" UNIQUE("account_id")
);
--> statement-breakpoint
ALTER TABLE "audit_logs" ALTER COLUMN "account_id" DROP NOT NULL;
--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN "result" text DEFAULT 'success' NOT NULL;
--> statement-breakpoint
CREATE INDEX "admin_role_permissions_permission_idx" ON "admin_role_permissions" USING btree ("permission_id");
--> statement-breakpoint
CREATE INDEX "admin_memberships_role_status_idx" ON "admin_memberships" USING btree ("role_id", "status");
--> statement-breakpoint

INSERT INTO "admin_roles" ("code", "name", "description") VALUES
  ('support', 'Support', 'Customer and pet support access.'),
  ('operations', 'Operations', 'Production and fulfilment operations access.'),
  ('admin', 'Administrator', 'Catalog, operations and non-critical settings access.'),
  ('super_admin', 'Super administrator', 'Privileged access management and critical administration.')
ON CONFLICT ("code") DO NOTHING;
--> statement-breakpoint
INSERT INTO "admin_permissions" ("code", "name", "description") VALUES
  ('admin.dashboard.read', 'View admin dashboard', 'Access the administrative foundation dashboard.'),
  ('customers.read', 'View customers', 'Read minimum customer support information.'),
  ('customers.update', 'Update customers', 'Update customer support information.'),
  ('pets.read', 'View pets', 'Read pet records for support or operations.'),
  ('pets.update', 'Update pets', 'Update pet records with authorization.'),
  ('tags.read', 'View NFC tags', 'Read NFC tag status.'),
  ('tags.manage', 'Manage NFC tags', 'Manage NFC tag operations.'),
  ('orders.read', 'View orders', 'Read order records.'),
  ('orders.update', 'Update orders', 'Update operational order data.'),
  ('orders.cancel', 'Cancel orders', 'Cancel eligible orders.'),
  ('products.read', 'View products', 'Read product catalog records.'),
  ('products.manage', 'Manage products', 'Manage catalog records.'),
  ('inventory.read', 'View inventory', 'Read inventory records.'),
  ('inventory.manage', 'Manage inventory', 'Manage inventory records.'),
  ('fulfilments.read', 'View fulfilments', 'Read fulfilment records.'),
  ('fulfilments.manage', 'Manage fulfilments', 'Manage fulfilment operations.'),
  ('payments.read', 'View payments', 'Read payment status records.'),
  ('admins.read', 'View team access', 'Read administrative membership information.'),
  ('admins.manage', 'Manage team access', 'Grant, change or disable administrative membership.'),
  ('audit.read', 'View audit logs', 'Read administrative audit records.'),
  ('settings.read', 'View settings', 'Read administrative settings.'),
  ('settings.manage', 'Manage settings', 'Manage non-critical administrative settings.')
ON CONFLICT ("code") DO NOTHING;
--> statement-breakpoint
INSERT INTO "admin_role_permissions" ("role_id", "permission_id")
SELECT role_record.id, permission_record.id
FROM (VALUES
  ('support', 'admin.dashboard.read'), ('support', 'customers.read'), ('support', 'pets.read'), ('support', 'tags.read'), ('support', 'orders.read'), ('support', 'payments.read'),
  ('operations', 'admin.dashboard.read'), ('operations', 'customers.read'), ('operations', 'pets.read'), ('operations', 'tags.read'), ('operations', 'orders.read'), ('operations', 'orders.update'), ('operations', 'inventory.read'), ('operations', 'inventory.manage'), ('operations', 'fulfilments.read'), ('operations', 'fulfilments.manage'),
  ('admin', 'admin.dashboard.read'), ('admin', 'customers.read'), ('admin', 'customers.update'), ('admin', 'pets.read'), ('admin', 'pets.update'), ('admin', 'tags.read'), ('admin', 'tags.manage'), ('admin', 'orders.read'), ('admin', 'orders.update'), ('admin', 'orders.cancel'), ('admin', 'products.read'), ('admin', 'products.manage'), ('admin', 'inventory.read'), ('admin', 'inventory.manage'), ('admin', 'fulfilments.read'), ('admin', 'fulfilments.manage'), ('admin', 'payments.read'), ('admin', 'audit.read'), ('admin', 'settings.read'), ('admin', 'settings.manage')
) AS mapping(role_code, permission_code)
JOIN "admin_roles" AS role_record ON role_record.code = mapping.role_code
JOIN "admin_permissions" AS permission_record ON permission_record.code = mapping.permission_code
ON CONFLICT DO NOTHING;
--> statement-breakpoint
INSERT INTO "admin_role_permissions" ("role_id", "permission_id")
SELECT role_record.id, permission_record.id
FROM "admin_roles" AS role_record
CROSS JOIN "admin_permissions" AS permission_record
WHERE role_record.code = 'super_admin'
ON CONFLICT DO NOTHING;
--> statement-breakpoint

ALTER TABLE "admin_roles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "admin_permissions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "admin_role_permissions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "admin_memberships" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
REVOKE ALL ON TABLE "admin_roles", "admin_permissions", "admin_role_permissions", "admin_memberships" FROM PUBLIC;
REVOKE ALL ON TABLE "admin_roles", "admin_permissions", "admin_role_permissions", "admin_memberships" FROM anon, authenticated;
