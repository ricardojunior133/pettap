import "server-only";

import { and, desc, eq } from "drizzle-orm";

import { fulfilments, orderItems, orders, transactionalNotifications } from "@/db/schema";
import { createDatabaseClient } from "@/lib/backend/db";

import type { TransactionalEmailPayload, TransactionalNotificationEvent } from "./types";

export type TransactionalNotificationStatus = "pending" | "sent" | "failed";

export type TransactionalNotificationRecord = {
  id: string;
  orderId: string;
  accountId: string | null;
  notificationType: TransactionalNotificationEvent;
  recipient: string;
  subject: string;
  payload: TransactionalEmailPayload;
  provider: string;
  status: TransactionalNotificationStatus;
  providerMessageId: string | null;
  errorMessage: string | null;
  createdAt: Date;
  sentAt: Date | null;
  failedAt: Date | null;
};

export type TransactionalOrderContext = {
  id: string;
  accountId: string | null;
  orderNumber: string;
  customerEmail: string;
  petName: string;
  summary: string;
  trackingUrl: string | null;
  carrier: string | null;
  trackingNumber: string | null;
};

export interface TransactionalNotificationRepository {
  findByOrderAndType(orderId: string, type: TransactionalNotificationEvent): Promise<TransactionalNotificationRecord | null>;
  createPending(input: Omit<TransactionalNotificationRecord, "id" | "status" | "providerMessageId" | "errorMessage" | "createdAt" | "sentAt" | "failedAt">): Promise<TransactionalNotificationRecord | null>;
  markSent(id: string, providerMessageId: string | null): Promise<void>;
  markFailed(id: string, errorMessage: string): Promise<void>;
  listByOrder(orderId: string): Promise<TransactionalNotificationRecord[]>;
  getOrderContext(orderId: string): Promise<TransactionalOrderContext | null>;
}

function toRecord(row: typeof transactionalNotifications.$inferSelect): TransactionalNotificationRecord {
  return {
    id: row.id,
    orderId: row.orderId,
    accountId: row.accountId,
    notificationType: row.notificationType as TransactionalNotificationEvent,
    recipient: row.recipient,
    subject: row.subject,
    payload: row.payload as TransactionalEmailPayload,
    provider: row.provider,
    status: row.status,
    providerMessageId: row.providerMessageId,
    errorMessage: row.errorMessage,
    createdAt: row.createdAt,
    sentAt: row.sentAt,
    failedAt: row.failedAt,
  };
}

export class DrizzleTransactionalNotificationRepository implements TransactionalNotificationRepository {
  async findByOrderAndType(orderId: string, type: TransactionalNotificationEvent) {
    const database = createDatabaseClient();
    const [row] = await database.select().from(transactionalNotifications)
      .where(and(eq(transactionalNotifications.orderId, orderId), eq(transactionalNotifications.notificationType, type)))
      .limit(1);
    return row ? toRecord(row) : null;
  }

  async createPending(input: Omit<TransactionalNotificationRecord, "id" | "status" | "providerMessageId" | "errorMessage" | "createdAt" | "sentAt" | "failedAt">) {
    const database = createDatabaseClient();
    const [created] = await database.insert(transactionalNotifications).values({
      ...input,
      status: "pending",
    }).onConflictDoNothing({
      target: [transactionalNotifications.orderId, transactionalNotifications.notificationType],
    }).returning();
    return created ? toRecord(created) : null;
  }

  async markSent(id: string, providerMessageId: string | null) {
    const database = createDatabaseClient();
    await database.update(transactionalNotifications).set({
      status: "sent",
      providerMessageId,
      sentAt: new Date(),
      errorMessage: null,
      failedAt: null,
      updatedAt: new Date(),
    }).where(eq(transactionalNotifications.id, id));
  }

  async markFailed(id: string, errorMessage: string) {
    const database = createDatabaseClient();
    await database.update(transactionalNotifications).set({
      status: "failed",
      errorMessage: errorMessage.slice(0, 500),
      failedAt: new Date(),
      updatedAt: new Date(),
    }).where(eq(transactionalNotifications.id, id));
  }

  async listByOrder(orderId: string) {
    const database = createDatabaseClient();
    const rows = await database.select().from(transactionalNotifications)
      .where(eq(transactionalNotifications.orderId, orderId))
      .orderBy(desc(transactionalNotifications.createdAt));
    return rows.map(toRecord);
  }

  async getOrderContext(orderId: string) {
    const database = createDatabaseClient();
    const [orderRows, itemRows, fulfilmentRows] = await Promise.all([
      database.select({ id: orders.id, accountId: orders.accountId, orderNumber: orders.orderNumber, customerEmail: orders.customerEmail })
        .from(orders).where(eq(orders.id, orderId)).limit(1),
      database.select({ productName: orderItems.productName, variantName: orderItems.variantName, personalisation: orderItems.personalisation })
        .from(orderItems).where(eq(orderItems.orderId, orderId)).limit(1),
      database.select({ trackingUrl: fulfilments.trackingUrl, provider: fulfilments.provider, trackingNumber: fulfilments.trackingNumber })
        .from(fulfilments).where(eq(fulfilments.orderId, orderId)).orderBy(desc(fulfilments.createdAt)).limit(1),
    ]);
    const order = orderRows[0];
    const item = itemRows[0];
    const fulfilment = fulfilmentRows[0];
    if (!order || !item) return null;
    const personalisation = item.personalisation;
    const selections = [personalisation?.collection, personalisation?.shape, personalisation?.colour, personalisation?.size, personalisation?.finish]
      .filter((value): value is string => Boolean(value));
    return {
      id: order.id,
      accountId: order.accountId,
      orderNumber: order.orderNumber,
      customerEmail: order.customerEmail,
      petName: personalisation?.petName || "Your pet",
      summary: selections.join(" · ") || `${item.productName} · ${item.variantName}`,
      trackingUrl: fulfilment?.trackingUrl ?? null,
      carrier: fulfilment?.provider ?? null,
      trackingNumber: fulfilment?.trackingNumber ?? null,
    };
  }
}
