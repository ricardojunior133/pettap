import "server-only";

import { and, count, desc, eq, ilike, or, sql } from "drizzle-orm";

import { fulfilments, orderItems, orders, orderStatusHistory } from "@/db/schema";
import { createDatabaseClient } from "@/lib/backend/db";

export type CustomerOrderListRecord = {
  orderId: string;
  orderNumber: string;
  createdAt: Date;
  status: string;
  paymentStatus: string;
  customerName: string;
  fulfilmentStatus: string;
  totalMinor: number;
  currency: string;
  itemCount: number;
  trackingSummary: string | null;
};

export type CustomerOrderDetailRecord = {
  order: {
    id: string;
    orderNumber: string;
    createdAt: Date;
    status: string; paymentStatus: string; customerName: string;
    fulfilmentStatus: string;
    currency: string;
    subtotalMinor: number;
    discountTotalMinor: number;
    shippingTotalMinor: number;
    taxTotalMinor: number;
    totalMinor: number;
    shippingAddressSnapshot: unknown;
  };
  items: Array<{
    productName: string;
    variantName: string;
    sku: string;
    quantity: number;
    unitPriceMinor: number;
    lineTotalMinor: number;
    personalisation: unknown;
  }>;
  fulfilment: { status: string; provider: string | null; trackingNumber: string | null; trackingUrl: string | null; shippedAt: Date | null; deliveredAt: Date | null } | null;
  history: Array<{ previousStatus: string | null; newStatus: string; createdAt: Date }>;
};

export type CustomerOrderPagination = { page: number; pageSize: number; query?: string };

export interface CustomerOrderRepository {
  listByAccount(accountId: string, pagination: CustomerOrderPagination): Promise<{ rows: CustomerOrderListRecord[]; total: number }>;
  getByIdForAccount(accountId: string, orderId: string): Promise<CustomerOrderDetailRecord | null>;
}

export class DrizzleCustomerOrderRepository implements CustomerOrderRepository {
  async listByAccount(accountId: string, pagination: CustomerOrderPagination) {
    const database = createDatabaseClient();
    const itemCount = sql<number>`(select count(*) from ${orderItems} where ${orderItems.orderId} = ${orders.id})`;
    const trackingSummary = sql<string | null>`(select ${fulfilments.trackingNumber} from ${fulfilments} where ${fulfilments.orderId} = ${orders.id} and ${fulfilments.trackingNumber} is not null order by ${fulfilments.createdAt} desc limit 1)`;
    const search = pagination.query?.trim(); const where = and(eq(orders.accountId, accountId), search ? or(ilike(orders.orderNumber, `%${search}%`), sql`exists (select 1 from ${orderItems} as customer_item where customer_item.order_id = ${orders.id} and (customer_item.personalisation ->> 'petName') ilike ${`%${search}%`})`) : undefined);
    const [rows, totalRows] = await Promise.all([
      database
        .select({ orderId: orders.id, orderNumber: orders.orderNumber, createdAt: orders.createdAt, status: orders.status, paymentStatus: orders.paymentStatus, customerName: orders.customerName, fulfilmentStatus: orders.fulfilmentStatus, totalMinor: orders.grandTotalMinor, currency: orders.currency, itemCount, trackingSummary })
        .from(orders)
        .where(where)
        .orderBy(desc(orders.createdAt), desc(orders.orderNumber))
        .limit(pagination.pageSize)
        .offset((pagination.page - 1) * pagination.pageSize),
      database.select({ value: count() }).from(orders).where(where),
    ]);

    return { rows, total: totalRows[0]?.value ?? 0 };
  }

  async getByIdForAccount(accountId: string, orderId: string): Promise<CustomerOrderDetailRecord | null> {
    const database = createDatabaseClient();
    const [order] = await database
      .select({ id: orders.id, orderNumber: orders.orderNumber, customerName: orders.customerName, createdAt: orders.createdAt, status: orders.status, paymentStatus: orders.paymentStatus, fulfilmentStatus: orders.fulfilmentStatus, currency: orders.currency, subtotalMinor: orders.subtotalMinor, discountTotalMinor: orders.discountTotalMinor, shippingTotalMinor: orders.shippingTotalMinor, taxTotalMinor: orders.taxTotalMinor, totalMinor: orders.grandTotalMinor, shippingAddressSnapshot: orders.shippingAddressSnapshot })
      .from(orders)
      .where(and(eq(orders.id, orderId), eq(orders.accountId, accountId)))
      .limit(1);
    if (!order) return null;

    const [items, fulfilmentRows, history] = await Promise.all([
      database.select({ productName: orderItems.productName, variantName: orderItems.variantName, sku: orderItems.sku, quantity: orderItems.quantity, unitPriceMinor: orderItems.unitPriceMinor, lineTotalMinor: orderItems.lineTotalMinor, personalisation: orderItems.personalisation }).from(orderItems).where(eq(orderItems.orderId, order.id)),
      database.select({ status: fulfilments.status, provider: fulfilments.provider, trackingNumber: fulfilments.trackingNumber, trackingUrl: fulfilments.trackingUrl, shippedAt: fulfilments.shippedAt, deliveredAt: fulfilments.deliveredAt }).from(fulfilments).where(eq(fulfilments.orderId, order.id)).orderBy(desc(fulfilments.createdAt)).limit(1),
      database.select({ previousStatus: orderStatusHistory.previousStatus, newStatus: orderStatusHistory.newStatus, createdAt: orderStatusHistory.createdAt }).from(orderStatusHistory).where(eq(orderStatusHistory.orderId, order.id)).orderBy(orderStatusHistory.createdAt),
    ]);

    return { order, items, fulfilment: fulfilmentRows[0] ?? null, history };
  }
}
