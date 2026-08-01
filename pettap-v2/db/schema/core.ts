import { relations, sql } from "drizzle-orm";
import { boolean, check, date, index, integer, jsonb, numeric, pgEnum, pgTable, text, timestamp, unique, uniqueIndex, uuid } from "drizzle-orm/pg-core";

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
/** Private lifecycle for platform-mediated finder contact requests. */
export const contactRequestStatus = pgEnum("contact_request_status", ["pending", "delivered", "closed", "expired", "cancelled"]);
/** Delivery lifecycle for private finder-contact notices, independent of orders. */
export const contactRequestNotificationType = pgEnum("contact_request_notification_type", ["finder_contact_received"]);
export const contactRequestNotificationStatus = pgEnum("contact_request_notification_status", ["pending", "processing", "sent", "failed", "cancelled"]);
/** Internal-only lifecycle for a physical NFC write attempt. */
export const nfcTagProvisioningStatus = pgEnum("nfc_tag_provisioning_status", ["pending", "issued", "write_confirmed", "activated", "expired", "cancelled", "failed"]);

export const pets = pgTable("pets", {
  id: uuid("id").defaultRandom().primaryKey(),
  accountId: uuid("account_id").notNull().references(() => accounts.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  species: text("species").notNull(),
  breed: text("breed"),
  birthDate: date("birth_date"),
  sex: text("sex"),
  weight: numeric("weight", { precision: 6, scale: 2 }),
  colour: text("colour"),
  publicId: text("public_id").notNull(),
  publicProfileEnabled: boolean("public_profile_enabled").default(false).notNull(),
  archivedAt: timestamp("archived_at", { withTimezone: true }),
  ...timestamps,
}, (table) => [
  uniqueIndex("pets_public_id_unique").on(table.publicId),
  index("pets_account_idx").on(table.accountId),
  index("pets_account_archived_idx").on(table.accountId, table.archivedAt),
  index("pets_account_created_idx").on(table.accountId, table.createdAt),
  index("pets_name_lower_idx").on(sql`lower(${table.name})`),
  check("pets_sex_check", sql`${table.sex} IS NULL OR ${table.sex} IN ('male', 'female', 'unknown')`),
  check("pets_weight_positive_check", sql`${table.weight} IS NULL OR ${table.weight} > 0`),
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

export const lostReports = pgTable("lost_reports", {
  id: uuid("id").defaultRandom().primaryKey(),
  petId: uuid("pet_id").notNull().references(() => pets.id),
  // Legacy reports keep their original pet/details data. New reports use the
  // canonical open/closed lifecycle and always record the opening timestamp.
  tagId: uuid("tag_id").references(() => nfcTags.id),
  actorAccountId: uuid("actor_account_id").references(() => accounts.id),
  status: text("status").default("open").notNull(),
  details: jsonb("details").notNull(),
  openedAt: timestamp("opened_at", { withTimezone: true }).defaultNow().notNull(),
  closedAt: timestamp("closed_at", { withTimezone: true }),
  ...timestamps,
}, (table) => [
  index("lost_reports_pet_id_idx").on(table.petId),
  index("lost_reports_tag_id_idx").on(table.tagId),
  index("lost_reports_actor_account_id_idx").on(table.actorAccountId),
  // Closed reports remain immutable history; only one current report may exist.
  uniqueIndex("lost_reports_one_open_per_pet_idx").on(table.petId).where(sql`${table.status} = 'open' AND ${table.tagId} IS NOT NULL AND ${table.actorAccountId} IS NOT NULL`),
  uniqueIndex("lost_reports_one_open_per_tag_idx").on(table.tagId).where(sql`${table.status} = 'open' AND ${table.tagId} IS NOT NULL AND ${table.actorAccountId} IS NOT NULL`),
  check("lost_reports_status_open_or_closed", sql`${table.status} IN ('open', 'closed')`),
  check("lost_reports_closed_at_matches_status", sql`(${table.status} = 'open' AND ${table.closedAt} IS NULL) OR (${table.status} = 'closed' AND ${table.closedAt} IS NOT NULL)`),
  check("lost_reports_tag_required_for_canonical_records", sql`${table.tagId} IS NOT NULL`),
  check("lost_reports_actor_required_for_canonical_records", sql`${table.actorAccountId} IS NOT NULL`),
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

/**
 * A short-lived, secret-free record of a physical NFC provisioning attempt.
 * The plaintext challenge is intentionally never persisted.
 */
export const nfcTagProvisioningSessions = pgTable("nfc_tag_provisioning_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  tagId: uuid("tag_id").notNull().references(() => nfcTags.id, { onDelete: "cascade" }),
  credentialId: uuid("credential_id").notNull().references(() => nfcTagCredentials.id, { onDelete: "restrict" }),
  initiatedByAccountId: uuid("initiated_by_account_id").notNull().references(() => accounts.id, { onDelete: "restrict" }),
  status: nfcTagProvisioningStatus("status").default("pending").notNull(),
  challengeHash: text("challenge_hash").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  issuedAt: timestamp("issued_at", { withTimezone: true }),
  writeConfirmedAt: timestamp("write_confirmed_at", { withTimezone: true }),
  activatedAt: timestamp("activated_at", { withTimezone: true }),
  cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
  failureCode: text("failure_code"),
  ...timestamps,
}, (table) => [
  uniqueIndex("nfc_tag_provisioning_sessions_challenge_hash_unique").on(table.challengeHash),
  index("nfc_tag_provisioning_sessions_tag_idx").on(table.tagId),
  index("nfc_tag_provisioning_sessions_expiry_idx").on(table.status, table.expiresAt),
  uniqueIndex("nfc_tag_provisioning_sessions_one_open_per_tag").on(table.tagId)
    .where(sql`${table.status} in ('pending', 'issued', 'write_confirmed')`),
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

/** Private finder input. This table is never selected by the public resolver. */
export const contactRequests = pgTable("contact_requests", {
  id: uuid("id").defaultRandom().primaryKey(),
  lostReportId: uuid("lost_report_id").notNull().references(() => lostReports.id, { onDelete: "restrict" }),
  petId: uuid("pet_id").notNull().references(() => pets.id, { onDelete: "restrict" }),
  tagId: uuid("tag_id").notNull().references(() => nfcTags.id, { onDelete: "restrict" }),
  status: contactRequestStatus("status").default("pending").notNull(),
  finderName: text("finder_name").notNull(),
  finderContact: text("finder_contact").notNull(),
  message: text("message").notNull(),
  actorHash: text("actor_hash").notNull(),
  processedAt: timestamp("processed_at", { withTimezone: true }),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  ...timestamps,
}, (table) => [
  index("contact_requests_lost_report_idx").on(table.lostReportId),
  index("contact_requests_tag_status_created_idx").on(table.tagId, table.status, table.createdAt),
  index("contact_requests_pet_status_created_idx").on(table.petId, table.status, table.createdAt),
  check("contact_requests_processed_after_created", sql`${table.processedAt} IS NULL OR ${table.processedAt} >= ${table.createdAt}`),
  check("contact_requests_resolved_after_created", sql`${table.resolvedAt} IS NULL OR ${table.resolvedAt} >= ${table.createdAt}`),
]);

/**
 * Private, retryable notification outbox for contact requests. Recipient email
 * is retained only so a retry addresses the same owner without exposing it to
 * any UI or audit record.
 */
export const contactRequestNotifications = pgTable("contact_request_notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  contactRequestId: uuid("contact_request_id").notNull().references(() => contactRequests.id, { onDelete: "restrict" }),
  type: contactRequestNotificationType("type").notNull(),
  status: contactRequestNotificationStatus("status").default("pending").notNull(),
  recipientEmail: text("recipient_email").notNull(),
  attemptCount: integer("attempt_count").notNull().default(0),
  lastAttemptAt: timestamp("last_attempt_at", { withTimezone: true }),
  sentAt: timestamp("sent_at", { withTimezone: true }),
  failedAt: timestamp("failed_at", { withTimezone: true }),
  nextRetryAt: timestamp("next_retry_at", { withTimezone: true }),
  provider: text("provider").notNull(),
  providerMessageId: text("provider_message_id"),
  safeErrorCode: text("safe_error_code"),
  ...timestamps,
}, (table) => [
  uniqueIndex("contact_request_notifications_request_type_unique").on(table.contactRequestId, table.type),
  index("contact_request_notifications_status_retry_idx").on(table.status, table.nextRetryAt),
  index("contact_request_notifications_request_idx").on(table.contactRequestId),
]);

export const accountsRelations = relations(accounts, ({ many }) => ({
  pets: many(pets),
  nfcTags: many(nfcTags, { relationName: "accountNfcTags" }),
  suspendedNfcTags: many(nfcTags, { relationName: "suspendedByAccount" }),
  tagActivations: many(tagActivations),
  createdNfcTagCredentials: many(nfcTagCredentials, { relationName: "credentialCreatedByAccount" }),
  initiatedNfcTagProvisioningSessions: many(nfcTagProvisioningSessions, { relationName: "provisioningInitiatedByAccount" }),
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
  provisioningSessions: many(nfcTagProvisioningSessions),
}));

export const nfcTagCredentialsRelations = relations(nfcTagCredentials, ({ one, many }) => ({
  tag: one(nfcTags, { fields: [nfcTagCredentials.tagId], references: [nfcTags.id] }),
  createdByAccount: one(accounts, {
    fields: [nfcTagCredentials.createdByAccountId],
    references: [accounts.id],
    relationName: "credentialCreatedByAccount",
  }),
  provisioningSessions: many(nfcTagProvisioningSessions),
}));

export const nfcTagProvisioningSessionsRelations = relations(nfcTagProvisioningSessions, ({ one }) => ({
  tag: one(nfcTags, { fields: [nfcTagProvisioningSessions.tagId], references: [nfcTags.id] }),
  credential: one(nfcTagCredentials, { fields: [nfcTagProvisioningSessions.credentialId], references: [nfcTagCredentials.id] }),
  initiatedByAccount: one(accounts, {
    fields: [nfcTagProvisioningSessions.initiatedByAccountId],
    references: [accounts.id],
    relationName: "provisioningInitiatedByAccount",
  }),
}));

export const tagActivationsRelations = relations(tagActivations, ({ one }) => ({
  tag: one(nfcTags, { fields: [tagActivations.tagId], references: [nfcTags.id] }),
  account: one(accounts, { fields: [tagActivations.accountId], references: [accounts.id] }),
}));
