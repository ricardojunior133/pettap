import "server-only";

import { and, desc, eq, isNull } from "drizzle-orm";

import { checkoutAttempts, orderItems, orders, payments, stripeWebhookEvents, type AddressSnapshot, type GuestCheckoutConfigurationSnapshot } from "@/db/schema";
import { createDatabaseClient } from "@/lib/backend/db";
import { logStripeDevelopment } from "@/lib/backend/stripe-diagnostics";

export type CheckoutAttemptStatus = "draft" | "pending_payment" | "paid" | "payment_failed" | "expired" | "cancelled";
export type WebhookProcessingStatus = "received" | "processed" | "failed";

export interface CheckoutAttemptRecord {
  id: string;
  checkoutReference: string;
  accountId: string | null;
  customerId: string | null;
  orderId: string | null;
  status: CheckoutAttemptStatus;
  currency: "GBP";
  subtotalMinor: number;
  shippingMinor: number;
  totalMinor: number;
  customerEmail: string;
  customerName: string;
  shippingAddressSnapshot: AddressSnapshot | null;
  configurationSnapshot: GuestCheckoutConfigurationSnapshot;
  stripeCheckoutSessionId: string | null;
  stripePaymentIntentId: string | null;
  paidAt: Date | null;
  createdAt: Date;
}

export interface CreateCheckoutAttemptRecord extends Omit<CheckoutAttemptRecord, "id" | "accountId" | "customerId" | "orderId" | "status" | "stripeCheckoutSessionId" | "stripePaymentIntentId" | "paidAt" | "createdAt"> {
  accountId?: string | null;
  customerId?: string | null;
}

export interface WebhookEventClaim {
  id: string;
  stripeEventId: string;
  eventType: string;
  processingStatus: WebhookProcessingStatus;
  isNew: boolean;
}

export interface CheckoutAttemptRepository {
  create(input: CreateCheckoutAttemptRecord): Promise<CheckoutAttemptRecord>;
  findByReference(checkoutReference: string): Promise<CheckoutAttemptRecord | null>;
  findByStripeSessionId(sessionId: string): Promise<CheckoutAttemptRecord | null>;
  findOrderNumber(orderId: string): Promise<string | null>;
  attachStripeIdentifiers(checkoutReference: string, identifiers: { sessionId?: string; paymentIntentId?: string }): Promise<void>;
  claimWebhookEvent(input: { stripeEventId: string; eventType: string; checkoutAttemptId?: string }): Promise<WebhookEventClaim>;
  completeWebhookEvent(id: string, status: Exclude<WebhookProcessingStatus, "received">, failureCode?: string): Promise<void>;
  createPaidOrder(input: { checkoutAttemptId: string; orderNumber: string; stripeSessionId: string; stripePaymentIntentId?: string }): Promise<{ orderId: string; orderNumber: string } | null>;
}

export function toOrderItemPersonalisation(snapshot: GuestCheckoutConfigurationSnapshot) {
  return {
    ...(snapshot.petName ? { petName: snapshot.petName } : {}),
    colour: snapshot.colour,
    ...(snapshot.lineColour ? { lineColour: snapshot.lineColour } : {}),
    ...(snapshot.primaryColour ? { primaryColour: snapshot.primaryColour } : {}),
    ...(snapshot.accentColour ? { accentColour: snapshot.accentColour } : {}),
    shape: snapshot.shape,
    size: snapshot.size,
    material: "PETG",
    finish: snapshot.finish,
    collection: snapshot.collection,
    ...(snapshot.season ? { season: snapshot.season } : {}),
  };
}

function toRecord(row: typeof checkoutAttempts.$inferSelect): CheckoutAttemptRecord {
  return {
    id: row.id, checkoutReference: row.checkoutReference, accountId: row.accountId, customerId: row.customerId, orderId: row.orderId,
    status: row.status, currency: "GBP", subtotalMinor: row.subtotalMinor, shippingMinor: row.shippingMinor, totalMinor: row.totalMinor,
    customerEmail: row.customerEmail, customerName: row.customerName, shippingAddressSnapshot: row.shippingAddressSnapshot,
    configurationSnapshot: row.configurationSnapshot, stripeCheckoutSessionId: row.stripeCheckoutSessionId, stripePaymentIntentId: row.stripePaymentIntentId,
    paidAt: row.paidAt, createdAt: row.createdAt,
  };
}

export class DrizzleCheckoutAttemptRepository implements CheckoutAttemptRepository {
  async create(input: CreateCheckoutAttemptRecord): Promise<CheckoutAttemptRecord> {
    const database = createDatabaseClient();
    const [created] = await database.insert(checkoutAttempts).values({ ...input, status: "draft" }).returning();
    if (!created) throw new Error("Checkout attempt could not be created.");
    logStripeDevelopment("checkout.repository.created", { checkoutReference: created.checkoutReference, inputAccountId: input.accountId ?? null, persistedAccountId: created.accountId, inputCustomerId: input.customerId ?? null, persistedCustomerId: created.customerId });
    return toRecord(created);
  }

  async findByReference(checkoutReference: string): Promise<CheckoutAttemptRecord | null> {
    const database = createDatabaseClient();
    const [row] = await database.select().from(checkoutAttempts).where(eq(checkoutAttempts.checkoutReference, checkoutReference)).orderBy(desc(checkoutAttempts.createdAt)).limit(1);
    return row ? toRecord(row) : null;
  }

  async findByStripeSessionId(sessionId: string): Promise<CheckoutAttemptRecord | null> {
    const database = createDatabaseClient();
    const [row] = await database.select().from(checkoutAttempts).where(eq(checkoutAttempts.stripeCheckoutSessionId, sessionId)).limit(1);
    return row ? toRecord(row) : null;
  }

  async findOrderNumber(orderId: string): Promise<string | null> {
    const database = createDatabaseClient();
    const [row] = await database.select({ orderNumber: orders.orderNumber }).from(orders).where(eq(orders.id, orderId)).limit(1);
    return row?.orderNumber ?? null;
  }

  async attachStripeIdentifiers(checkoutReference: string, identifiers: { sessionId?: string; paymentIntentId?: string }): Promise<void> {
    const database = createDatabaseClient();
    await database.update(checkoutAttempts).set({
      stripeCheckoutSessionId: identifiers.sessionId,
      stripePaymentIntentId: identifiers.paymentIntentId,
      status: "pending_payment",
      updatedAt: new Date(),
    }).where(eq(checkoutAttempts.checkoutReference, checkoutReference));
  }

  async claimWebhookEvent(input: { stripeEventId: string; eventType: string; checkoutAttemptId?: string }): Promise<WebhookEventClaim> {
    const database = createDatabaseClient();
    const [created] = await database.insert(stripeWebhookEvents).values(input).onConflictDoNothing({ target: stripeWebhookEvents.stripeEventId }).returning();
    if (created) return { id: created.id, stripeEventId: created.stripeEventId, eventType: created.eventType, processingStatus: created.processingStatus, isNew: true };

    const [existing] = await database.select().from(stripeWebhookEvents).where(eq(stripeWebhookEvents.stripeEventId, input.stripeEventId)).limit(1);
    if (!existing) throw new Error("Webhook event could not be claimed.");
    if (existing.processingStatus === "failed") {
      const [reopened] = await database.update(stripeWebhookEvents).set({ processingStatus: "received", processedAt: null, failureCode: null }).where(and(eq(stripeWebhookEvents.id, existing.id), eq(stripeWebhookEvents.processingStatus, "failed"))).returning();
      if (reopened) return { id: reopened.id, stripeEventId: reopened.stripeEventId, eventType: reopened.eventType, processingStatus: reopened.processingStatus, isNew: true };
    }
    return { id: existing.id, stripeEventId: existing.stripeEventId, eventType: existing.eventType, processingStatus: existing.processingStatus, isNew: false };
  }

  async completeWebhookEvent(id: string, status: Exclude<WebhookProcessingStatus, "received">, failureCode?: string): Promise<void> {
    const database = createDatabaseClient();
    await database.update(stripeWebhookEvents).set({ processingStatus: status, processedAt: new Date(), failureCode: failureCode ?? null }).where(eq(stripeWebhookEvents.id, id));
  }

  async createPaidOrder(input: { checkoutAttemptId: string; orderNumber: string; stripeSessionId: string; stripePaymentIntentId?: string }) {
    const database = createDatabaseClient();
    return database.transaction(async (transaction) => {
      const [attempt] = await transaction.select().from(checkoutAttempts).where(eq(checkoutAttempts.id, input.checkoutAttemptId)).limit(1);
      if (!attempt) throw new Error("Checkout attempt was not found.");
      if (attempt.orderId) {
        const [existingOrder] = await transaction.select({ orderNumber: orders.orderNumber }).from(orders).where(eq(orders.id, attempt.orderId)).limit(1);
        return { orderId: attempt.orderId, orderNumber: existingOrder?.orderNumber ?? input.orderNumber };
      }
      const snapshot = attempt.configurationSnapshot;
      if (!snapshot.productId || !snapshot.variantId || !snapshot.productName || !snapshot.variantName) {
        throw new Error("Checkout attempt has no canonical product snapshot.");
      }
      const [order] = await transaction.insert(orders).values({
        orderNumber: input.orderNumber,
        customerId: attempt.customerId,
        accountId: attempt.accountId,
        status: "paid",
        paymentStatus: "paid",
        fulfilmentStatus: "unfulfilled",
        currency: attempt.currency,
        subtotalMinor: attempt.subtotalMinor,
        shippingTotalMinor: attempt.shippingMinor,
        discountTotalMinor: 0,
        taxTotalMinor: 0,
        grandTotalMinor: attempt.totalMinor,
        shippingAddressSnapshot: attempt.shippingAddressSnapshot,
        customerEmail: attempt.customerEmail,
        customerName: attempt.customerName,
      }).returning();
      if (!order) throw new Error("Order could not be created.");
      await transaction.insert(orderItems).values({
        orderId: order.id,
        productId: snapshot.productId,
        variantId: snapshot.variantId,
        sku: snapshot.sku,
        productName: snapshot.productName,
        variantName: snapshot.variantName,
        quantity: snapshot.quantity,
        unitPriceMinor: snapshot.unitAmountMinor,
        lineTotalMinor: snapshot.quantity * snapshot.unitAmountMinor,
        currency: attempt.currency,
        personalisation: toOrderItemPersonalisation(snapshot),
      });
      await transaction.insert(payments).values({
        orderId: order.id,
        provider: "stripe",
        providerPaymentId: input.stripePaymentIntentId ?? input.stripeSessionId,
        status: "paid",
        amountMinor: attempt.totalMinor,
        currency: attempt.currency,
        paidAt: new Date(),
      });
      const [updated] = await transaction.update(checkoutAttempts).set({
        orderId: order.id,
        status: "paid",
        stripeCheckoutSessionId: input.stripeSessionId,
        stripePaymentIntentId: input.stripePaymentIntentId,
        paidAt: new Date(),
        updatedAt: new Date(),
      }).where(and(eq(checkoutAttempts.id, attempt.id), isNull(checkoutAttempts.orderId))).returning({ id: checkoutAttempts.id });
      if (!updated) throw new Error("Checkout attempt was already promoted.");
      return { orderId: order.id, orderNumber: order.orderNumber };
    });
  }
}
