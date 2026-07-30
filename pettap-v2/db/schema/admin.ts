import { check, index, pgEnum, pgTable, primaryKey, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

import { accounts } from "./core";
import { orders } from "./commerce";

export const adminMembershipStatus = pgEnum("admin_membership_status", ["active", "disabled"]);

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
};

export const adminRoles = pgTable("admin_roles", {
  id: uuid("id").defaultRandom().primaryKey(),
  code: text("code").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  ...timestamps,
}, (table) => [uniqueIndex("admin_roles_code_unique").on(table.code)]);

export const adminPermissions = pgTable("admin_permissions", {
  id: uuid("id").defaultRandom().primaryKey(),
  code: text("code").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [uniqueIndex("admin_permissions_code_unique").on(table.code)]);

export const adminRolePermissions = pgTable("admin_role_permissions", {
  roleId: uuid("role_id").notNull().references(() => adminRoles.id, { onDelete: "restrict" }),
  permissionId: uuid("permission_id").notNull().references(() => adminPermissions.id, { onDelete: "restrict" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [primaryKey({ columns: [table.roleId, table.permissionId], name: "admin_role_permissions_pkey" }), index("admin_role_permissions_permission_idx").on(table.permissionId)]);

export const adminMemberships = pgTable("admin_memberships", {
  id: uuid("id").defaultRandom().primaryKey(),
  accountId: uuid("account_id").notNull().references(() => accounts.id, { onDelete: "restrict" }),
  roleId: uuid("role_id").notNull().references(() => adminRoles.id, { onDelete: "restrict" }),
  status: adminMembershipStatus("status").default("active").notNull(),
  createdByAccountId: uuid("created_by_account_id").references(() => accounts.id, { onDelete: "set null" }),
  disabledAt: timestamp("disabled_at", { withTimezone: true }),
  disabledByAccountId: uuid("disabled_by_account_id").references(() => accounts.id, { onDelete: "set null" }),
  ...timestamps,
}, (table) => [
  uniqueIndex("admin_memberships_account_unique").on(table.accountId),
  index("admin_memberships_role_status_idx").on(table.roleId, table.status),
]);

export const orderAdminNotes = pgTable("order_admin_notes", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id").notNull().references(() => orders.id, { onDelete: "restrict" }),
  actorAccountId: uuid("actor_account_id").notNull().references(() => accounts.id, { onDelete: "restrict" }),
  body: text("body").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("order_admin_notes_order_created_idx").on(table.orderId, table.createdAt),
  check("order_admin_notes_body_check", sql`char_length(${table.body}) BETWEEN 1 AND 2000`),
]);
