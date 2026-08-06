import "server-only";

import { and, asc, desc, eq } from "drizzle-orm";

import { fulfilments, orderItems, orders, orderStatusHistory, transactionalNotifications } from "@/db/schema";
import { createDatabaseClient } from "@/lib/backend/db";

export type PublicTrackingRecord = {
  order: { id: string; orderNumber: string; createdAt: Date; status: string; fulfilmentStatus: string };
  item: { productName: string; variantName: string; personalisation: { petName?: string; collection?: string; design?: string; shape?: string; colour?: string; size?: string } | null } | null;
  fulfilment: { status: string; provider: string | null; trackingNumber: string | null; trackingUrl: string | null; shippedAt: Date | null; deliveredAt: Date | null } | null;
  notifications: Array<{ notificationType: string; sentAt: Date | null; createdAt: Date }>;
  history: Array<{ newStatus: string; reason: string | null; createdAt: Date }>;
};

export interface PublicOrderTrackingRepositoryContract {
  findByOrderNumber(orderNumber: string): Promise<PublicTrackingRecord | null>;
}

export class PublicOrderTrackingRepository implements PublicOrderTrackingRepositoryContract {
  async findByOrderNumber(orderNumber: string): Promise<PublicTrackingRecord | null> {
    const database = createDatabaseClient();
    const [order] = await database
      .select({ id: orders.id, orderNumber: orders.orderNumber, createdAt: orders.createdAt, status: orders.status, fulfilmentStatus: orders.fulfilmentStatus })
      .from(orders)
      .where(eq(orders.orderNumber, orderNumber))
      .limit(1);
    if (!order) return null;

    const [itemRows, fulfilmentRows, notifications, history] = await Promise.all([
      database.select({ productName: orderItems.productName, variantName: orderItems.variantName, personalisation: orderItems.personalisation })
        .from(orderItems).where(eq(orderItems.orderId, order.id)).orderBy(asc(orderItems.createdAt)).limit(1),
      database.select({ status: fulfilments.status, provider: fulfilments.provider, trackingNumber: fulfilments.trackingNumber, trackingUrl: fulfilments.trackingUrl, shippedAt: fulfilments.shippedAt, deliveredAt: fulfilments.deliveredAt })
        .from(fulfilments).where(eq(fulfilments.orderId, order.id)).orderBy(desc(fulfilments.createdAt)).limit(1),
      database.select({ notificationType: transactionalNotifications.notificationType, sentAt: transactionalNotifications.sentAt, createdAt: transactionalNotifications.createdAt })
        .from(transactionalNotifications).where(and(eq(transactionalNotifications.orderId, order.id), eq(transactionalNotifications.status, "sent"))).orderBy(asc(transactionalNotifications.createdAt)),
      database.select({ newStatus: orderStatusHistory.newStatus, reason: orderStatusHistory.reason, createdAt: orderStatusHistory.createdAt })
        .from(orderStatusHistory).where(eq(orderStatusHistory.orderId, order.id)).orderBy(asc(orderStatusHistory.createdAt)),
    ]);

    return { order, item: itemRows[0] ?? null, fulfilment: fulfilmentRows[0] ?? null, notifications, history };
  }
}
