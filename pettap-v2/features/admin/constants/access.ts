export const adminRoleCodes = ["support", "operations", "admin", "super_admin"] as const;
export type AdminRoleCode = (typeof adminRoleCodes)[number];

export const adminPermissionCodes = [
  "admin.dashboard.read",
  "customers.read",
  "customers.update",
  "customers.support_view",
  "pets.read",
  "pets.update",
  "pets.support_view",
  "tags.read",
  "tags.manage",
  "tags.suspend",
  "tags.reactivate",
  "tags.reassign",
  "orders.read",
  "orders.update",
  "orders.cancel",
  "orders.update_status",
  "orders.add_internal_note",
  "products.read",
  "products.manage",
  "inventory.read",
  "inventory.manage",
  "production.read",
  "production.update",
  "fulfilments.read",
  "fulfilments.manage",
  "fulfilments.create",
  "fulfilments.update",
  "fulfilments.dispatch",
  "payments.read",
  "lost_reports.read",
  "activity.read",
  "audit.read",
  "settings.read",
  "settings.manage",
  "admins.read",
  "admins.manage",
  "event_demo.view",
  "event_demo.manage",
] as const;

export type AdminPermissionCode = (typeof adminPermissionCodes)[number];

export const adminRoleLabels: Record<AdminRoleCode, string> = {
  support: "Support",
  operations: "Operations",
  admin: "Administrator",
  super_admin: "Super administrator",
};
