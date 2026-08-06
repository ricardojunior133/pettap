import { boolean, check, index, integer, jsonb, pgEnum, pgTable, text, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

import { accounts } from "./core";

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
};

export const productStatus = pgEnum("product_status", ["draft", "active", "archived"]);
export const productType = pgEnum("product_type", ["nfc_tag", "collar", "accessory", "bundle", "replacement"]);
export const variantStatus = pgEnum("variant_status", ["draft", "active", "archived"]);
export const priceStatus = pgEnum("price_status", ["draft", "active", "archived"]);
export const addressType = pgEnum("address_type", ["shipping", "billing"]);
export const orderStatus = pgEnum("order_status", ["draft", "pending_payment", "paid", "in_production", "ready_to_ship", "shipped", "completed", "cancelled", "refunded"]);
export const paymentStatus = pgEnum("payment_status", ["unpaid", "pending", "paid", "partially_refunded", "refunded", "failed", "cancelled"]);
export const fulfilmentStatus = pgEnum("fulfilment_status", ["unfulfilled", "queued", "in_production", "ready", "shipped", "delivered", "cancelled"]);
export const productionStatus = pgEnum("production_status", ["not_started", "queued", "printing", "quality_check", "completed", "failed", "cancelled"]);
export const checkoutStatus = pgEnum("checkout_status", ["draft", "pending_payment", "paid", "payment_failed", "expired", "cancelled"]);
export const stripeWebhookProcessingStatus = pgEnum("stripe_webhook_processing_status", ["received", "processed", "failed"]);
export const transactionalNotificationStatus = pgEnum("transactional_notification_status", ["pending", "sent", "failed"]);

export type AddressSnapshot = {
  fullName: string;
  company?: string | null;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  county?: string | null;
  postcode: string;
  countryCode: string;
  phone?: string | null;
};

export type OrderItemPersonalisation = {
  collection?: string;
  season?: string;
  petName?: string;
  colour?: string;
  lineColour?: string;
  primaryColour?: string;
  accentColour?: string;
  font?: string;
  shape?: string;
  size?: string;
  finish?: string;
  material?: string;
};

/** Immutable, server-calculated product selection stored before payment. */
export type GuestCheckoutConfigurationSnapshot = {
  collection: string;
  season?: string;
  shape: string;
  colour: string;
  lineColour?: string;
  primaryColour?: string;
  accentColour?: string;
  size: string;
  finish: string;
  petName?: string;
  sku: string;
  unitAmountMinor: number;
  quantity: number;
  productId?: string;
  variantId?: string;
  productName?: string;
  variantName?: string;
};

export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  description: text("description"),
  status: productStatus("status").default("draft").notNull(),
  productType: productType("product_type").default("nfc_tag").notNull(),
  isPersonalisable: boolean("is_personalisable").default(true).notNull(),
  archivedAt: timestamp("archived_at", { withTimezone: true }),
  ...timestamps,
}, (t) => [uniqueIndex("products_slug_unique").on(t.slug)]);

export const productVariants = pgTable("product_variants", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "restrict" }),
  sku: text("sku").notNull(),
  name: text("name").notNull(),
  status: variantStatus("status").default("draft").notNull(),
  shape: text("shape").notNull(),
  size: text("size").notNull(),
  material: text("material").notNull(),
  finish: text("finish").notNull(),
  trackInventory: boolean("track_inventory").default(false).notNull(),
  archivedAt: timestamp("archived_at", { withTimezone: true }),
  ...timestamps,
}, (t) => [uniqueIndex("product_variants_sku_unique").on(t.sku), index("product_variants_product_id_idx").on(t.productId)]);

export const productPrices = pgTable("product_prices", {
  id: uuid("id").defaultRandom().primaryKey(),
  variantId: uuid("variant_id").notNull().references(() => productVariants.id, { onDelete: "restrict" }),
  currency: varchar("currency", { length: 3 }).default("GBP").notNull(),
  unitAmountMinor: integer("unit_amount_minor").notNull(),
  status: priceStatus("status").default("draft").notNull(),
  startsAt: timestamp("starts_at", { withTimezone: true }),
  endsAt: timestamp("ends_at", { withTimezone: true }),
  externalPriceId: text("external_price_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  index("product_prices_variant_currency_status_idx").on(t.variantId, t.currency, t.status),
  // PostgreSQL assigns this name to the unnamed CHECK in migration 0003.
  check("product_prices_unit_amount_minor_check", sql`${t.unitAmountMinor} >= 0`),
]);

export const inventoryItems = pgTable("inventory_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  variantId: uuid("variant_id").notNull().references(() => productVariants.id, { onDelete: "restrict" }),
  quantityOnHand: integer("quantity_on_hand").default(0).notNull(),
  quantityReserved: integer("quantity_reserved").default(0).notNull(),
  reorderLevel: integer("reorder_level").default(0).notNull(),
  ...timestamps,
}, (t) => [uniqueIndex("inventory_items_variant_unique").on(t.variantId), check("inventory_items_quantities_valid", sql`${t.quantityOnHand} >= 0 AND ${t.quantityReserved} >= 0 AND ${t.quantityReserved} <= ${t.quantityOnHand} AND ${t.reorderLevel} >= 0`)]);

export const customers = pgTable("customers", {
  id: uuid("id").defaultRandom().primaryKey(),
  accountId: uuid("account_id").notNull().references(() => accounts.id, { onDelete: "restrict" }),
  email: text("email").notNull(),
  fullName: text("full_name").notNull(),
  phone: text("phone"),
  ...timestamps,
}, (t) => [uniqueIndex("customers_account_unique").on(t.accountId)]);

export const customerAddresses = pgTable("customer_addresses", {
  id: uuid("id").defaultRandom().primaryKey(),
  customerId: uuid("customer_id").notNull().references(() => customers.id, { onDelete: "restrict" }),
  type: addressType("type").notNull(),
  fullName: text("full_name").notNull(),
  company: text("company"),
  addressLine1: text("address_line_1").notNull(),
  addressLine2: text("address_line_2"),
  city: text("city").notNull(),
  county: text("county"),
  postcode: text("postcode").notNull(),
  countryCode: varchar("country_code", { length: 2 }).default("GB").notNull(),
  phone: text("phone"),
  isDefault: boolean("is_default").default(false).notNull(),
  ...timestamps,
}, (t) => [index("customer_addresses_customer_id_idx").on(t.customerId)]);

export const shippingMethods = pgTable("shipping_methods", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull(),
  countryCode: varchar("country_code", { length: 2 }).default("GB").notNull(),
  priceMinor: integer("price_minor").notNull(),
  currency: varchar("currency", { length: 3 }).default("GBP").notNull(),
  estimatedMinDays: integer("estimated_min_days").notNull(),
  estimatedMaxDays: integer("estimated_max_days").notNull(),
  active: boolean("active").default(true).notNull(),
  ...timestamps,
}, (t) => [uniqueIndex("shipping_methods_code_unique").on(t.code), check("shipping_methods_values_valid", sql`${t.priceMinor} >= 0 AND ${t.estimatedMinDays} >= 0 AND ${t.estimatedMaxDays} >= ${t.estimatedMinDays}`)]);

export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderNumber: text("order_number").notNull(),
  // Guest orders are deliberately explicit: they have no account or customer until
  // a future authenticated association is requested by the owner.
  customerId: uuid("customer_id").references(() => customers.id, { onDelete: "restrict" }),
  accountId: uuid("account_id").references(() => accounts.id, { onDelete: "restrict" }),
  status: orderStatus("status").default("draft").notNull(),
  paymentStatus: paymentStatus("payment_status").default("unpaid").notNull(),
  fulfilmentStatus: fulfilmentStatus("fulfilment_status").default("unfulfilled").notNull(),
  currency: varchar("currency", { length: 3 }).default("GBP").notNull(),
  subtotalMinor: integer("subtotal_minor").default(0).notNull(),
  discountTotalMinor: integer("discount_total_minor").default(0).notNull(),
  shippingTotalMinor: integer("shipping_total_minor").default(0).notNull(),
  taxTotalMinor: integer("tax_total_minor").default(0).notNull(),
  grandTotalMinor: integer("grand_total_minor").default(0).notNull(),
  shippingAddressSnapshot: jsonb("shipping_address_snapshot").$type<AddressSnapshot | null>(),
  billingAddressSnapshot: jsonb("billing_address_snapshot").$type<AddressSnapshot | null>(),
  customerEmail: text("customer_email").notNull(),
  customerName: text("customer_name").notNull(),
  notes: text("notes"),
  cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  ...timestamps,
}, (t) => [uniqueIndex("orders_order_number_unique").on(t.orderNumber), index("orders_account_created_idx").on(t.accountId, t.createdAt), index("orders_customer_id_idx").on(t.customerId), check("orders_totals_nonnegative", sql`${t.subtotalMinor} >= 0 AND ${t.discountTotalMinor} >= 0 AND ${t.shippingTotalMinor} >= 0 AND ${t.taxTotalMinor} >= 0 AND ${t.grandTotalMinor} >= 0`)]);

export const transactionalNotifications = pgTable("transactional_notifications", { id: uuid("id").defaultRandom().primaryKey(), accountId: uuid("account_id").references(() => accounts.id, { onDelete: "set null" }), orderId: uuid("order_id").notNull().references(() => orders.id, { onDelete: "restrict" }), notificationType: text("notification_type").notNull(), recipient: text("recipient").notNull(), subject: text("subject").notNull(), payload: jsonb("payload").notNull(), provider: text("provider").notNull(), status: transactionalNotificationStatus("status").default("pending").notNull(), providerMessageId: text("provider_message_id"), errorMessage: text("error_message"), sentAt: timestamp("sent_at", { withTimezone: true }), failedAt: timestamp("failed_at", { withTimezone: true }), ...timestamps }, (t) => [uniqueIndex("transactional_notifications_order_type_unique").on(t.orderId, t.notificationType), index("transactional_notifications_account_created_idx").on(t.accountId, t.createdAt), index("transactional_notifications_status_created_idx").on(t.status, t.createdAt)]);

/**
 * A private, pre-payment record for a guest or signed-in shopper. It is not an
 * order and is never read directly by the browser.
 */
export const checkoutAttempts = pgTable("checkout_attempts", {
  id: uuid("id").defaultRandom().primaryKey(),
  checkoutReference: text("checkout_reference").notNull(),
  accountId: uuid("account_id").references(() => accounts.id, { onDelete: "set null" }),
  customerId: uuid("customer_id").references(() => customers.id, { onDelete: "set null" }),
  orderId: uuid("order_id").references(() => orders.id, { onDelete: "set null" }),
  status: checkoutStatus("status").default("draft").notNull(),
  currency: varchar("currency", { length: 3 }).default("GBP").notNull(),
  subtotalMinor: integer("subtotal_minor").notNull(),
  shippingMinor: integer("shipping_minor").notNull(),
  totalMinor: integer("total_minor").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerName: text("customer_name").notNull(),
  shippingAddressSnapshot: jsonb("shipping_address_snapshot").$type<AddressSnapshot>(),
  configurationSnapshot: jsonb("configuration_snapshot").$type<GuestCheckoutConfigurationSnapshot>().notNull(),
  stripeCheckoutSessionId: text("stripe_checkout_session_id"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  ...timestamps,
}, (t) => [
  uniqueIndex("checkout_attempts_reference_unique").on(t.checkoutReference),
  uniqueIndex("checkout_attempts_order_unique").on(t.orderId),
  uniqueIndex("checkout_attempts_stripe_session_unique").on(t.stripeCheckoutSessionId).where(sql`${t.stripeCheckoutSessionId} IS NOT NULL`),
  uniqueIndex("checkout_attempts_stripe_payment_intent_unique").on(t.stripePaymentIntentId).where(sql`${t.stripePaymentIntentId} IS NOT NULL`),
  index("checkout_attempts_account_created_idx").on(t.accountId, t.createdAt),
  check("checkout_attempts_totals_nonnegative", sql`${t.subtotalMinor} >= 0 AND ${t.shippingMinor} >= 0 AND ${t.totalMinor} = ${t.subtotalMinor} + ${t.shippingMinor}`),
]);

/** Private idempotency ledger. No Stripe event payload or payment data is stored. */
export const stripeWebhookEvents = pgTable("stripe_webhook_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  stripeEventId: text("stripe_event_id").notNull(),
  eventType: text("event_type").notNull(),
  checkoutAttemptId: uuid("checkout_attempt_id").references(() => checkoutAttempts.id, { onDelete: "set null" }),
  processingStatus: stripeWebhookProcessingStatus("processing_status").default("received").notNull(),
  processedAt: timestamp("processed_at", { withTimezone: true }),
  failureCode: text("failure_code"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  uniqueIndex("stripe_webhook_events_event_unique").on(t.stripeEventId),
  index("stripe_webhook_events_attempt_created_idx").on(t.checkoutAttemptId, t.createdAt),
]);

export const orderItems = pgTable("order_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id").notNull().references(() => orders.id, { onDelete: "restrict" }),
  productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "restrict" }),
  variantId: uuid("variant_id").notNull().references(() => productVariants.id, { onDelete: "restrict" }),
  sku: text("sku").notNull(),
  productName: text("product_name").notNull(),
  variantName: text("variant_name").notNull(),
  quantity: integer("quantity").notNull(),
  unitPriceMinor: integer("unit_price_minor").notNull(),
  lineTotalMinor: integer("line_total_minor").notNull(),
  currency: varchar("currency", { length: 3 }).default("GBP").notNull(),
  personalisation: jsonb("personalisation").$type<OrderItemPersonalisation | null>(),
  productionStatus: productionStatus("production_status").default("not_started").notNull(),
  ...timestamps,
}, (t) => [index("order_items_order_id_idx").on(t.orderId), check("order_items_values_valid", sql`${t.quantity} > 0 AND ${t.unitPriceMinor} >= 0 AND ${t.lineTotalMinor} = ${t.quantity} * ${t.unitPriceMinor}`)]);

export const payments = pgTable("payments", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id").notNull().references(() => orders.id, { onDelete: "restrict" }),
  provider: text("provider").notNull(),
  providerPaymentId: text("provider_payment_id"),
  status: paymentStatus("status").default("unpaid").notNull(),
  amountMinor: integer("amount_minor").notNull(),
  currency: varchar("currency", { length: 3 }).default("GBP").notNull(),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  failedAt: timestamp("failed_at", { withTimezone: true }),
  refundedAt: timestamp("refunded_at", { withTimezone: true }),
  ...timestamps,
}, (t) => [
  index("payments_order_id_idx").on(t.orderId),
  uniqueIndex("payments_provider_payment_id_unique").on(t.provider, t.providerPaymentId).where(sql`${t.providerPaymentId} IS NOT NULL`),
  check("payments_amount_nonnegative", sql`${t.amountMinor} >= 0`),
]);

export const fulfilments = pgTable("fulfilments", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id").notNull().references(() => orders.id, { onDelete: "restrict" }),
  status: fulfilmentStatus("status").default("unfulfilled").notNull(),
  provider: text("provider"),
  trackingNumber: text("tracking_number"),
  trackingUrl: text("tracking_url"),
  shippedAt: timestamp("shipped_at", { withTimezone: true }),
  deliveredAt: timestamp("delivered_at", { withTimezone: true }),
  ...timestamps,
}, (t) => [index("fulfilments_order_id_idx").on(t.orderId)]);

export const orderStatusHistory = pgTable("order_status_history", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id").notNull().references(() => orders.id, { onDelete: "restrict" }),
  previousStatus: orderStatus("previous_status"),
  newStatus: orderStatus("new_status").notNull(),
  changedByAccountId: uuid("changed_by_account_id").references(() => accounts.id, { onDelete: "set null" }),
  reason: text("reason"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [index("order_status_history_order_id_idx").on(t.orderId)]);

export const orderAdminNotes = pgTable("order_admin_notes", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id").notNull().references(() => orders.id, { onDelete: "restrict" }),
  actorAccountId: uuid("actor_account_id").notNull().references(() => accounts.id, { onDelete: "restrict" }),
  body: text("body").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  index("order_admin_notes_order_created_idx").on(t.orderId, t.createdAt),
  check("order_admin_notes_body_check", sql`char_length(${t.body}) BETWEEN 1 AND 2000`),
]);
