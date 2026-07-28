import { relations, sql } from "drizzle-orm";
import { boolean, index, jsonb, pgEnum, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
};

/** The account primitives required by Event Demo authorization and auditing. */
export const accounts = pgTable("accounts", {
  id: uuid("id").primaryKey(),
  ...timestamps,
});

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(),
  accountId: uuid("account_id").notNull().references(() => accounts.id, { onDelete: "cascade" }),
  displayName: text("display_name").notNull(),
  phone: text("phone"),
  ...timestamps,
});

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  accountId: uuid("account_id").references(() => accounts.id),
  action: text("action").notNull(),
  targetType: text("target_type").notNull(),
  targetId: uuid("target_id"),
  result: text("result").default("success").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// Reconciled with migrations 0000, 0005, and 0007. These mappings do not issue SQL.
export const tagStatus = pgEnum("tag_status", ["unassigned", "active", "suspended", "lost", "retired"]);

export const pets = pgTable("pets", {
  id: uuid("id").defaultRandom().primaryKey(),
  accountId: uuid("account_id").notNull().references(() => accounts.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  species: text("species").notNull(),
  publicId: text("public_id").notNull(),
  publicProfileEnabled: boolean("public_profile_enabled").default(false).notNull(),
  archivedAt: timestamp("archived_at", { withTimezone: true }),
  ...timestamps,
}, (table) => [
  uniqueIndex("pets_public_id_unique").on(table.publicId),
  index("pets_account_idx").on(table.accountId),
  index("pets_account_archived_idx").on(table.accountId, table.archivedAt),
  index("pets_name_lower_idx").on(sql`lower(${table.name})`),
]);

export const nfcTags = pgTable("nfc_tags", {
  id: uuid("id").defaultRandom().primaryKey(),
  publicId: text("public_id").notNull(),
  accountId: uuid("account_id").references(() => accounts.id, { onDelete: "set null" }),
  petId: uuid("pet_id").references(() => pets.id, { onDelete: "set null" }),
  status: tagStatus("status").default("unassigned").notNull(),
  suspendedAt: timestamp("suspended_at", { withTimezone: true }),
  suspendedByAccountId: uuid("suspended_by_account_id").references(() => accounts.id, { onDelete: "set null" }),
  suspensionReasonCode: text("suspension_reason_code"),
  suspensionReason: text("suspension_reason"),
  ...timestamps,
}, (table) => [
  uniqueIndex("nfc_tags_public_id_unique").on(table.publicId),
  index("nfc_tags_account_idx").on(table.accountId),
  index("nfc_tags_pet_idx").on(table.petId),
  index("nfc_tags_status_idx").on(table.status),
]);

export const tagActivations = pgTable("tag_activations", {
  id: uuid("id").defaultRandom().primaryKey(),
  tagId: uuid("tag_id").notNull().references(() => nfcTags.id),
  accountId: uuid("account_id").notNull().references(() => accounts.id),
  status: text("status").notNull(),
  ...timestamps,
}, (table) => [index("tag_activations_account_id_idx").on(table.accountId)]);

export const accountsRelations = relations(accounts, ({ many }) => ({
  pets: many(pets),
  nfcTags: many(nfcTags, { relationName: "accountNfcTags" }),
  suspendedNfcTags: many(nfcTags, { relationName: "suspendedByAccount" }),
  tagActivations: many(tagActivations),
}));

export const petsRelations = relations(pets, ({ one, many }) => ({
  account: one(accounts, { fields: [pets.accountId], references: [accounts.id] }),
  nfcTags: many(nfcTags),
}));

export const nfcTagsRelations = relations(nfcTags, ({ one, many }) => ({
  account: one(accounts, { fields: [nfcTags.accountId], references: [accounts.id], relationName: "accountNfcTags" }),
  pet: one(pets, { fields: [nfcTags.petId], references: [pets.id] }),
  suspendedByAccount: one(accounts, { fields: [nfcTags.suspendedByAccountId], references: [accounts.id], relationName: "suspendedByAccount" }),
  activations: many(tagActivations),
}));

export const tagActivationsRelations = relations(tagActivations, ({ one }) => ({
  tag: one(nfcTags, { fields: [tagActivations.tagId], references: [nfcTags.id] }),
  account: one(accounts, { fields: [tagActivations.accountId], references: [accounts.id] }),
}));
