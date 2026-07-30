import { relations, sql } from "drizzle-orm";
import { boolean, index, jsonb, pgEnum, pgTable, text, timestamp, unique, uniqueIndex, uuid } from "drizzle-orm/pg-core";

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

export const activityLogs = pgTable("activity_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  accountId: uuid("account_id").notNull().references(() => accounts.id),
  type: text("type").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [index("activity_logs_account_id_idx").on(table.accountId)]);

// Reconciled with migrations 0000, 0005, and 0007. These mappings do not issue SQL.
export const tagStatus = pgEnum("tag_status", ["unassigned", "active", "suspended", "lost", "retired"]);
export const nfcTagCredentialStatus = pgEnum("nfc_tag_credential_status", ["active", "rotated", "revoked"]);

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

export const emergencyContacts = pgTable("emergency_contacts", {
  id: uuid("id").defaultRandom().primaryKey(),
  petId: uuid("pet_id").notNull().references(() => pets.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  relationship: text("relationship").notNull(),
  phone: text("phone").notNull(),
  isPrimary: boolean("is_primary").default(false).notNull(),
  ...timestamps,
}, (table) => [index("emergency_contacts_pet_id_idx").on(table.petId)]);

export const futureOrders = pgTable("future_orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  accountId: uuid("account_id").references(() => accounts.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const futureProducts = pgTable("future_products", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [unique("future_products_slug_unique").on(table.slug)]);

export const petPhotos = pgTable("pet_photos", {
  id: uuid("id").defaultRandom().primaryKey(),
  petId: uuid("pet_id").notNull().references(() => pets.id, { onDelete: "cascade" }),
  storagePath: text("storage_path").notNull(),
  isPrimary: boolean("is_primary").default(false).notNull(),
  ...timestamps,
}, (table) => [
  index("pet_photos_pet_id_idx").on(table.petId),
  uniqueIndex("pet_photos_one_primary_per_pet_idx").on(table.petId).where(sql`${table.isPrimary}`),
]);

export const medicalInformation = pgTable("medical_information", {
  petId: uuid("pet_id").primaryKey().references(() => pets.id, { onDelete: "cascade" }),
  encryptedPayload: jsonb("encrypted_payload").notNull(),
  ...timestamps,
});

export const lostReports = pgTable("lost_reports", {
  id: uuid("id").defaultRandom().primaryKey(),
  petId: uuid("pet_id").notNull().references(() => pets.id),
  status: text("status").notNull(),
  details: jsonb("details").notNull(),
  ...timestamps,
}, (table) => [index("lost_reports_pet_id_idx").on(table.petId)]);

export const notifications = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  accountId: uuid("account_id").notNull().references(() => accounts.id),
  channel: text("channel").notNull(),
  payload: jsonb("payload").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [index("notifications_account_id_idx").on(table.accountId)]);

export const settings = pgTable("settings", {
  accountId: uuid("account_id").primaryKey().references(() => accounts.id, { onDelete: "cascade" }),
  payload: jsonb("payload").notNull(),
  ...timestamps,
});

export const vaccinations = pgTable("vaccinations", {
  id: uuid("id").defaultRandom().primaryKey(),
  petId: uuid("pet_id").notNull().references(() => pets.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  administeredAt: timestamp("administered_at", { withTimezone: true }).notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
}, (table) => [index("vaccinations_pet_id_idx").on(table.petId)]);

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

/** Private, one-time NFC credentials. Plaintext credentials are never stored. */
export const nfcTagCredentials = pgTable("nfc_tag_credentials", {
  id: uuid("id").defaultRandom().primaryKey(),
  tagId: uuid("tag_id").notNull().references(() => nfcTags.id, { onDelete: "cascade" }),
  credentialHash: text("credential_hash").notNull(),
  credentialHint: text("credential_hint").notNull(),
  status: nfcTagCredentialStatus("status").default("active").notNull(),
  createdByAccountId: uuid("created_by_account_id").references(() => accounts.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  rotatedAt: timestamp("rotated_at", { withTimezone: true }),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
}, (table) => [
  uniqueIndex("nfc_tag_credentials_hash_unique").on(table.credentialHash),
  index("nfc_tag_credentials_tag_idx").on(table.tagId),
  index("nfc_tag_credentials_status_idx").on(table.status),
  uniqueIndex("nfc_tag_credentials_one_active_per_tag").on(table.tagId).where(sql`${table.status} = 'active'`),
]);

export const tagActivations = pgTable("tag_activations", {
  id: uuid("id").defaultRandom().primaryKey(),
  tagId: uuid("tag_id").notNull().references(() => nfcTags.id),
  accountId: uuid("account_id").notNull().references(() => accounts.id),
  status: text("status").notNull(),
  ...timestamps,
}, (table) => [index("tag_activations_account_id_idx").on(table.accountId)]);

export const nfcTagStatusHistory = pgTable("nfc_tag_status_history", {
  id: uuid("id").defaultRandom().primaryKey(),
  tagId: uuid("tag_id").notNull().references(() => nfcTags.id, { onDelete: "restrict" }),
  previousStatus: tagStatus("previous_status"),
  newStatus: tagStatus("new_status").notNull(),
  reasonCode: text("reason_code"),
  reason: text("reason"),
  changedByAccountId: uuid("changed_by_account_id").references(() => accounts.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [index("nfc_tag_status_history_tag_created_idx").on(table.tagId, table.createdAt)]);

export const petPublicPreferences = pgTable("pet_public_preferences", {
  petId: uuid("pet_id").primaryKey().references(() => pets.id, { onDelete: "cascade" }),
  showPhoto: boolean("show_photo").default(false).notNull(),
  showName: boolean("show_name").default(false).notNull(),
  showBreed: boolean("show_breed").default(false).notNull(),
  showAge: boolean("show_age").default(false).notNull(),
  showMedicalConditions: boolean("show_medical_conditions").default(false).notNull(),
  showMedications: boolean("show_medications").default(false).notNull(),
  showPrimaryContact: boolean("show_primary_contact").default(false).notNull(),
  showEmergencyContacts: boolean("show_emergency_contacts").default(false).notNull(),
  showSpecialInstructions: boolean("show_special_instructions").default(false).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const accountsRelations = relations(accounts, ({ many }) => ({
  pets: many(pets),
  nfcTags: many(nfcTags, { relationName: "accountNfcTags" }),
  suspendedNfcTags: many(nfcTags, { relationName: "suspendedByAccount" }),
  tagActivations: many(tagActivations),
  createdNfcTagCredentials: many(nfcTagCredentials, { relationName: "credentialCreatedByAccount" }),
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
  credentials: many(nfcTagCredentials),
}));

export const nfcTagCredentialsRelations = relations(nfcTagCredentials, ({ one }) => ({
  tag: one(nfcTags, { fields: [nfcTagCredentials.tagId], references: [nfcTags.id] }),
  createdByAccount: one(accounts, {
    fields: [nfcTagCredentials.createdByAccountId],
    references: [accounts.id],
    relationName: "credentialCreatedByAccount",
  }),
}));

export const tagActivationsRelations = relations(tagActivations, ({ one }) => ({
  tag: one(nfcTags, { fields: [tagActivations.tagId], references: [nfcTags.id] }),
  account: one(accounts, { fields: [tagActivations.accountId], references: [accounts.id] }),
}));
