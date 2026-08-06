import { sql } from "drizzle-orm";
import { boolean, check, index, integer, pgEnum, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
};

export const eventDemoTagStatus = pgEnum("event_demo_tag_status", ["available", "in_progress", "completed", "expired", "disabled"]);
export const eventDemoSessionStatus = pgEnum("event_demo_session_status", ["started", "profile_created", "completed", "expired", "deleted"]);
export const eventDemoSpecies = pgEnum("event_demo_species", ["dog", "cat", "other"]);
export const leadSource = pgEnum("lead_source", ["coming_soon", "event_demo", "fair", "manual"]);

export const eventDemoTags = pgTable("event_demo_tags", {
  id: uuid("id").defaultRandom().primaryKey(),
  publicCode: text("public_code").notNull(),
  internalName: text("internal_name").notNull(),
  status: eventDemoTagStatus("status").default("available").notNull(),
  isEnabled: boolean("is_enabled").default(true).notNull(),
  sessionDurationMinutes: integer("session_duration_minutes").default(60).notNull(),
  usageCount: integer("usage_count").default(0).notNull(),
  lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
  lastResetAt: timestamp("last_reset_at", { withTimezone: true }),
  ...timestamps,
}, (table) => [
  uniqueIndex("event_demo_tags_public_code_unique").on(table.publicCode),
  index("event_demo_tags_status_idx").on(table.status),
  index("event_demo_tags_enabled_idx").on(table.isEnabled),
  check("event_demo_tags_session_duration_range", sql`session_duration_minutes between 10 and 240`),
  check("event_demo_tags_usage_count_nonnegative", sql`usage_count >= 0`),
]);

export const eventDemoSessions = pgTable("event_demo_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  publicId: text("public_id").notNull(),
  demoTagId: uuid("demo_tag_id").notNull().references(() => eventDemoTags.id, { onDelete: "restrict" }),
  sessionTokenHash: text("session_token_hash").notNull(),
  status: eventDemoSessionStatus("status").default("started").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  petName: text("pet_name"),
  species: eventDemoSpecies("species"),
  breed: text("breed"),
  age: text("age"),
  personality: text("personality"),
  ownerFirstName: text("owner_first_name"),
  contactTelephone: text("contact_telephone"),
  contactEmail: text("contact_email"),
  photoStoragePath: text("photo_storage_path"),
  showOwnerFirstName: boolean("show_owner_first_name").default(false).notNull(),
  showTelephone: boolean("show_telephone").default(false).notNull(),
  showEmail: boolean("show_email").default(false).notNull(),
  showBreed: boolean("show_breed").default(false).notNull(),
  showAge: boolean("show_age").default(false).notNull(),
  showPersonality: boolean("show_personality").default(false).notNull(),
  demoConsentAccepted: boolean("demo_consent_accepted").default(false).notNull(),
  demoConsentVersion: text("demo_consent_version"),
  demoConsentAcceptedAt: timestamp("demo_consent_accepted_at", { withTimezone: true }),
  marketingConsent: boolean("marketing_consent").default(false).notNull(),
  marketingConsentVersion: text("marketing_consent_version"),
  marketingConsentAt: timestamp("marketing_consent_at", { withTimezone: true }),
  ...timestamps,
}, (table) => [
  uniqueIndex("event_demo_sessions_public_id_unique").on(table.publicId),
  index("event_demo_sessions_tag_idx").on(table.demoTagId),
  index("event_demo_sessions_status_idx").on(table.status),
  index("event_demo_sessions_expires_at_idx").on(table.expiresAt),
]);

export const leads = pgTable("leads", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull(),
  firstName: text("first_name"),
  source: leadSource("source").notNull(),
  marketingConsent: boolean("marketing_consent").default(false).notNull(),
  consentVersion: text("consent_version"),
  consentedAt: timestamp("consented_at", { withTimezone: true }),
  ...timestamps,
}, (table) => [uniqueIndex("leads_email_normalized_unique").on(table.email)]);

export type EventDemoTag = typeof eventDemoTags.$inferSelect;
export type NewEventDemoTag = typeof eventDemoTags.$inferInsert;
export type EventDemoSession = typeof eventDemoSessions.$inferSelect;
export type NewEventDemoSession = typeof eventDemoSessions.$inferInsert;
export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;
