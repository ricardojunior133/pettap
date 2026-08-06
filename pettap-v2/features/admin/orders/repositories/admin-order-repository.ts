import "server-only";

import { and, count, desc, eq, ilike, or, sql } from "drizzle-orm";
import { auditLogs, checkoutAttempts, fulfilments, orderAdminNotes, orderItems, orders, orderStatusHistory, payments } from "@/db/schema";
import type { FulfilmentStatus } from "@/features/commerce/types/commerce";
import { createDatabaseClient } from "@/lib/backend/db";
import type { AdminOrderSearchInput } from "../schemas/admin-order-actions";

export class DrizzleAdminOrderRepository {
  async search(input: AdminOrderSearchInput) {
    const database = createDatabaseClient();
    const query = input.query ? `%${input.query}%` : undefined;
    const queryCondition = query ? or(
      ilike(orders.orderNumber, query), ilike(orders.customerName, query), ilike(orders.customerEmail, query),
      sql`exists (select 1 from ${orderItems} as search_item where search_item.order_id = ${orders.id} and (search_item.personalisation ->> 'petName') ilike ${query})`,
      sql`exists (select 1 from ${payments} as search_payment where search_payment.order_id = ${orders.id} and search_payment.provider_payment_id ilike ${query})`,
    ) : undefined;
    const conditions = [queryCondition, input.status === "all" ? undefined : eq(orders.status, input.status), input.paymentStatus === "all" ? undefined : eq(orders.paymentStatus, input.paymentStatus), input.fulfilmentStatus === "all" ? undefined : eq(orders.fulfilmentStatus, input.fulfilmentStatus)].filter(Boolean);
    const where = conditions.length ? and(...conditions) : undefined;
    const [rows, total] = await Promise.all([
      database.select({ id: orders.id, orderNumber: orders.orderNumber, customerName: orders.customerName, customerEmail: orders.customerEmail, status: orders.status, paymentStatus: orders.paymentStatus, fulfilmentStatus: orders.fulfilmentStatus, currency: orders.currency, total: orders.grandTotalMinor, createdAt: orders.createdAt, petName: sql<string | null>`max(${orderItems.personalisation} ->> 'petName')`, productName: sql<string | null>`max(${orderItems.productName})`, size: sql<string | null>`max(${orderItems.personalisation} ->> 'size')`, finish: sql<string | null>`max(${orderItems.personalisation} ->> 'finish')` }).from(orders).leftJoin(orderItems, eq(orderItems.orderId, orders.id)).where(where).groupBy(orders.id).orderBy(desc(orders.createdAt)).limit(input.limit).offset((input.page - 1) * input.limit),
      database.select({ value: count() }).from(orders).where(where),
    ]);
    return { rows, total: total[0]?.value ?? 0 };
  }
  async productionQueue() {
    const database = createDatabaseClient();
    return database.select({ id: orders.id, orderNumber: orders.orderNumber, createdAt: orders.createdAt, fulfilmentStatus: orders.fulfilmentStatus, status: orders.status, petName: sql<string | null>`max(${orderItems.personalisation} ->> 'petName')`, collection: sql<string | null>`max(${orderItems.personalisation} ->> 'collection')`, shape: sql<string | null>`max(${orderItems.personalisation} ->> 'shape')`, colour: sql<string | null>`max(${orderItems.personalisation} ->> 'colour')`, finish: sql<string | null>`max(${orderItems.personalisation} ->> 'finish')`, size: sql<string | null>`max(${orderItems.personalisation} ->> 'size')`, quantity: sql<number>`coalesce(sum(${orderItems.quantity}), 0)::int`, productionStatus: sql<"not_started" | "queued" | "printing" | "quality_check" | "completed" | "failed" | "cancelled" | null>`max(${orderItems.productionStatus}::text)` }).from(orders).innerJoin(orderItems, eq(orderItems.orderId, orders.id)).where(sql`${orders.paymentStatus} = 'paid' and ${orders.status} not in ('cancelled', 'refunded', 'completed')`).groupBy(orders.id).orderBy(orders.createdAt);
  }
  async detail(orderId: string) {
    const database = createDatabaseClient();
    const [order] = await database.select().from(orders).where(eq(orders.id, orderId)).limit(1);
    if (!order) return null;
    const [items, statusHistory, fulfilmentRows, notes, paymentRows, attempts] = await Promise.all([
      database.select().from(orderItems).where(eq(orderItems.orderId, orderId)),
      database.select().from(orderStatusHistory).where(eq(orderStatusHistory.orderId, orderId)).orderBy(desc(orderStatusHistory.createdAt)),
      database.select().from(fulfilments).where(eq(fulfilments.orderId, orderId)).orderBy(desc(fulfilments.createdAt)),
      database.select().from(orderAdminNotes).where(eq(orderAdminNotes.orderId, orderId)).orderBy(desc(orderAdminNotes.createdAt)),
      database.select().from(payments).where(eq(payments.orderId, orderId)).orderBy(desc(payments.createdAt)),
      database.select().from(checkoutAttempts).where(eq(checkoutAttempts.orderId, orderId)).orderBy(desc(checkoutAttempts.createdAt)).limit(1),
    ]);
    return { order, items, statusHistory, fulfilments: fulfilmentRows, notes, payments: paymentRows, checkoutAttempt: attempts[0] ?? null };
  }
  async listFulfilments() { const database = createDatabaseClient(); return database.select({ id: fulfilments.id, orderId: fulfilments.orderId, status: fulfilments.status, provider: fulfilments.provider, trackingNumber: fulfilments.trackingNumber, createdAt: fulfilments.createdAt }).from(fulfilments).orderBy(desc(fulfilments.createdAt)).limit(100); }
  async findFulfilment(fulfilmentId: string) { const database = createDatabaseClient(); const [row] = await database.select().from(fulfilments).where(eq(fulfilments.id, fulfilmentId)).limit(1); return row ?? null; }
  async changeStatus(orderId: string, nextStatus: typeof orders.$inferSelect.status, actorAccountId: string, reason?: string) {
    const database = createDatabaseClient();
    return database.transaction(async (tx) => {
      const [current] = await tx.select().from(orders).where(eq(orders.id, orderId)).limit(1);
      if (!current) return null;
      const [updated] = await tx.update(orders).set({ status: nextStatus, updatedAt: new Date(), cancelledAt: nextStatus === "cancelled" ? new Date() : current.cancelledAt, completedAt: nextStatus === "completed" ? new Date() : current.completedAt }).where(and(eq(orders.id, orderId), eq(orders.status, current.status))).returning();
      if (!updated) return "conflict" as const;
      await tx.insert(orderStatusHistory).values({ orderId, previousStatus: current.status, newStatus: nextStatus, changedByAccountId: actorAccountId, reason: reason ?? null });
      await tx.insert(auditLogs).values({ accountId: actorAccountId, action: "admin.order.status_changed", targetType: "order", targetId: orderId, result: "success", metadata: { previousStatus: current.status, nextStatus } });
      return updated;
    });
  }
  async updateFulfilmentStatus(orderId: string, nextStatus: FulfilmentStatus, actorAccountId: string) {
    const database = createDatabaseClient();
    return database.transaction(async (tx) => {
      const [order] = await tx.select().from(orders).where(eq(orders.id, orderId)).limit(1);
      if (!order) return null;
      const [latest] = await tx.select().from(fulfilments).where(eq(fulfilments.orderId, orderId)).orderBy(desc(fulfilments.createdAt)).limit(1);
      const currentStatus: FulfilmentStatus = latest?.status ?? "unfulfilled";
      const orderStatus: typeof orders.$inferSelect.status = ({ unfulfilled: "paid", queued: "paid", in_production: "in_production", ready: "ready_to_ship", shipped: "shipped", delivered: "completed", cancelled: "cancelled" } as const)[nextStatus];
      const now = new Date();
      const fulfilment = latest
        ? (await tx.update(fulfilments).set({ status: nextStatus, shippedAt: nextStatus === "shipped" ? now : latest.shippedAt, deliveredAt: nextStatus === "delivered" ? now : latest.deliveredAt, updatedAt: now }).where(eq(fulfilments.id, latest.id)).returning())[0]
        : (await tx.insert(fulfilments).values({ orderId, status: nextStatus, shippedAt: nextStatus === "shipped" ? now : null, deliveredAt: nextStatus === "delivered" ? now : null }).returning())[0];
      const [updated] = await tx.update(orders).set({ fulfilmentStatus: nextStatus, status: orderStatus, cancelledAt: nextStatus === "cancelled" ? now : order.cancelledAt, completedAt: nextStatus === "delivered" ? now : order.completedAt, updatedAt: now }).where(and(eq(orders.id, orderId), eq(orders.fulfilmentStatus, currentStatus))).returning();
      if (!updated || !fulfilment) return "conflict" as const;
      await tx.insert(orderStatusHistory).values({ orderId, previousStatus: order.status, newStatus: orderStatus, changedByAccountId: actorAccountId, reason: `Fulfilment ${currentStatus} to ${nextStatus}` });
      await tx.insert(auditLogs).values({ accountId: actorAccountId, action: "admin.order.fulfilment_updated", targetType: "order", targetId: orderId, result: "success", metadata: { previousStatus: currentStatus, nextStatus } });
      return updated;
    });
  }
  async updateProductionStatus(orderId: string, nextStatus: "printing" | "completed", actorAccountId: string) {
    const database = createDatabaseClient();
    return database.transaction(async (tx) => {
      const [order] = await tx.select().from(orders).where(eq(orders.id, orderId)).limit(1);
      if (!order || order.status === "cancelled" || order.status === "completed") return null;
      const [firstItem] = await tx.select({ id: orderItems.id, productionStatus: orderItems.productionStatus }).from(orderItems).where(eq(orderItems.orderId, orderId)).limit(1);
      if (!firstItem) return null;
      const nextOrderStatus = nextStatus === "printing" ? "in_production" : order.status;
      const now = new Date();
      await tx.update(orderItems).set({ productionStatus: nextStatus, updatedAt: now }).where(eq(orderItems.orderId, orderId));
      const [updated] = await tx.update(orders).set({ status: nextOrderStatus, updatedAt: now }).where(eq(orders.id, orderId)).returning();
      await tx.insert(orderStatusHistory).values({ orderId, previousStatus: order.status, newStatus: nextOrderStatus, changedByAccountId: actorAccountId, reason: `Production ${firstItem.productionStatus} to ${nextStatus}` });
      await tx.insert(auditLogs).values({ accountId: actorAccountId, action: "admin.order.production_updated", targetType: "order", targetId: orderId, result: "success", metadata: { nextStatus } });
      return updated;
    });
  }
  async shipOrder(orderId: string, trackingNumber: string, actorAccountId: string) {
    const database = createDatabaseClient();
    return database.transaction(async (tx) => {
      const [order] = await tx.select().from(orders).where(eq(orders.id, orderId)).limit(1);
      const [fulfilment] = await tx.select().from(fulfilments).where(eq(fulfilments.orderId, orderId)).orderBy(desc(fulfilments.createdAt)).limit(1);
      if (!order || !fulfilment || fulfilment.status !== "ready") return null;
      const now = new Date();
      await tx.update(fulfilments).set({ status: "shipped", trackingNumber: trackingNumber.trim().toUpperCase(), shippedAt: now, updatedAt: now }).where(eq(fulfilments.id, fulfilment.id));
      const [updated] = await tx.update(orders).set({ status: "shipped", fulfilmentStatus: "shipped", updatedAt: now }).where(and(eq(orders.id, orderId), eq(orders.fulfilmentStatus, "ready"))).returning();
      if (!updated) return "conflict" as const;
      await tx.insert(orderStatusHistory).values({ orderId, previousStatus: order.status, newStatus: "shipped", changedByAccountId: actorAccountId, reason: "Shipping label and tracking recorded" });
      await tx.insert(auditLogs).values({ accountId: actorAccountId, action: "admin.order.shipped", targetType: "order", targetId: orderId, result: "success", metadata: {} });
      return updated;
    });
  }
  async addNote(orderId: string, actorAccountId: string, body: string) {
    const database = createDatabaseClient();
    return database.transaction(async (tx) => {
      const [order] = await tx.select({ id: orders.id }).from(orders).where(eq(orders.id, orderId)).limit(1);
      if (!order) return null;
      const [note] = await tx.insert(orderAdminNotes).values({ orderId, actorAccountId, body }).returning();
      await tx.insert(auditLogs).values({ accountId: actorAccountId, action: "admin.order.note_added", targetType: "order", targetId: orderId, result: "success", metadata: {} });
      return note;
    });
  }
  async createFulfilment(orderId: string, actorAccountId: string, input: { provider?: string; trackingNumber?: string; trackingUrl?: string }) {
    const database = createDatabaseClient();
    return database.transaction(async (tx) => {
      const [order] = await tx.select().from(orders).where(eq(orders.id, orderId)).limit(1);
      if (!order || order.status === "cancelled" || order.status === "refunded") return null;
      const [created] = await tx.insert(fulfilments).values({ orderId, provider: input.provider ?? null, trackingNumber: input.trackingNumber?.trim().toUpperCase() ?? null, trackingUrl: input.trackingUrl ?? null, status: "queued" }).returning();
      await tx.insert(auditLogs).values({ accountId: actorAccountId, action: "admin.fulfilment.created", targetType: "fulfilment", targetId: created.id, result: "success", metadata: { orderId } });
      return created;
    });
  }
  async dispatchFulfilment(fulfilmentId: string, actorAccountId: string, shippedAt: Date) {
    const database = createDatabaseClient();
    return database.transaction(async (tx) => {
      const [current] = await tx.select().from(fulfilments).where(eq(fulfilments.id, fulfilmentId)).limit(1);
      if (!current || current.status === "cancelled" || current.status === "delivered") return null;
      const [updated] = await tx.update(fulfilments).set({ status: "shipped", shippedAt, updatedAt: new Date() }).where(eq(fulfilments.id, fulfilmentId)).returning();
      await tx.update(orders).set({ fulfilmentStatus: "shipped", status: "shipped", updatedAt: new Date() }).where(eq(orders.id, current.orderId));
      await tx.insert(orderStatusHistory).values({ orderId: current.orderId, previousStatus: "ready_to_ship", newStatus: "shipped", changedByAccountId: actorAccountId, reason: "Fulfilment dispatched" });
      await tx.insert(auditLogs).values({ accountId: actorAccountId, action: "admin.fulfilment.dispatched", targetType: "fulfilment", targetId: fulfilmentId, result: "success", metadata: { orderId: current.orderId } });
      return updated;
    });
  }
}
