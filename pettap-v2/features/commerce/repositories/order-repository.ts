import "server-only";

import { and, count, desc, eq, sql } from "drizzle-orm";

import { fulfilments, orderItems, orders, orderStatusHistory, payments } from "@/db/schema";
import { createDatabaseClient } from "@/lib/backend/db";

import type { FulfilmentStatus, OrderStatus, ProductionStatus } from "../types/commerce";

export type CustomerOrderReadRecord = {
  orderNumber: string;
  createdAt: Date;
  status: OrderStatus;
  fulfilmentStatus: FulfilmentStatus;
  totalMinor: number;
  currency: string;
  itemCount: number;
  trackingNumber: string | null;
};

export type CustomerOrderPage = {
  rows: CustomerOrderReadRecord[];
  total: number;
};

export type CustomerOrderPagination = {
  page: number;
  pageSize: number;
};

export type CustomerOrderDetailRecord = {
  order: {
    orderNumber: string;
    createdAt: Date;
    status: OrderStatus;
    fulfilmentStatus: FulfilmentStatus;
    currency: string;
    subtotalMinor: number;
    discountTotalMinor: number;
    shippingTotalMinor: number;
    taxTotalMinor: number;
    totalMinor: number;
    paymentStatus: string;
    cancelledAt: Date | null;
  };
  items: Array<{
    productName: string;
    variantName: string;
    sku: string;
    quantity: number;
    unitPriceMinor: number;
    lineTotalMinor: number;
    productionStatus: ProductionStatus;
    personalisation: unknown;
  }>;
  fulfilment: {
    status: FulfilmentStatus;
    carrier: string | null;
    trackingNumber: string | null;
    shippedAt: Date | null;
    deliveredAt: Date | null;
  } | null;
  paymentReceivedAt: Date | null;
  history: Array<{ status: string; occurredAt: Date }>;
};

export interface OrderRepository {
  listOrders(accountId: string, pagination: CustomerOrderPagination): Promise<CustomerOrderPage>;
  getOrderByNumber(accountId: string, orderNumber: string): Promise<CustomerOrderReadRecord | null>;
  getOrderDetailByNumber(accountId: string, orderNumber: string): Promise<CustomerOrderDetailRecord | null>;
}

/**
 * Read-only repository. Both queries include the account predicate, so a URL
 * changed in the browser can never read another account's order.
 */
export class DrizzleOrderRepository implements OrderRepository {
  async listOrders(accountId: string, { page, pageSize }: CustomerOrderPagination): Promise<CustomerOrderPage> {
    const database = createDatabaseClient();
    const where = eq(orders.accountId, accountId);
    const itemCount = sql<number>`(select count(*)::int from ${orderItems} where ${orderItems.orderId} = ${orders.id})`;
    const trackingNumber = sql<string | null>`(
      select ${fulfilments.trackingNumber}
      from ${fulfilments}
      where ${fulfilments.orderId} = ${orders.id} and ${fulfilments.trackingNumber} is not null
      order by ${fulfilments.createdAt} desc
      limit 1
    )`;

    const [rows, totalResult] = await Promise.all([
      database
        .select({
          orderNumber: orders.orderNumber,
          createdAt: orders.createdAt,
          status: orders.status,
          fulfilmentStatus: orders.fulfilmentStatus,
          totalMinor: orders.grandTotalMinor,
          currency: orders.currency,
          itemCount,
          trackingNumber,
        })
        .from(orders)
        .where(where)
        .orderBy(desc(orders.createdAt), desc(orders.orderNumber))
        .limit(pageSize)
        .offset((page - 1) * pageSize),
      database.select({ value: count() }).from(orders).where(where),
    ]);

    return {
      rows: rows.map((row) => ({ ...row, itemCount: Number(row.itemCount) })),
      total: Number(totalResult[0]?.value ?? 0),
    };
  }

  async getOrderByNumber(accountId: string, orderNumber: string): Promise<CustomerOrderReadRecord | null> {
    const database = createDatabaseClient();
    const itemCount = sql<number>`(select count(*)::int from ${orderItems} where ${orderItems.orderId} = ${orders.id})`;
    const trackingNumber = sql<string | null>`(
      select ${fulfilments.trackingNumber}
      from ${fulfilments}
      where ${fulfilments.orderId} = ${orders.id} and ${fulfilments.trackingNumber} is not null
      order by ${fulfilments.createdAt} desc
      limit 1
    )`;
    const [row] = await database
      .select({
        orderNumber: orders.orderNumber,
        createdAt: orders.createdAt,
        status: orders.status,
        fulfilmentStatus: orders.fulfilmentStatus,
        totalMinor: orders.grandTotalMinor,
        currency: orders.currency,
        itemCount,
        trackingNumber,
      })
      .from(orders)
      .where(and(eq(orders.accountId, accountId), eq(orders.orderNumber, orderNumber)))
      .limit(1);

    return row ? { ...row, itemCount: Number(row.itemCount) } : null;
  }

  async getOrderDetailByNumber(accountId: string, orderNumber: string): Promise<CustomerOrderDetailRecord | null> {
    const database = createDatabaseClient();
    const [ownedOrder] = await database
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        createdAt: orders.createdAt,
        status: orders.status,
        fulfilmentStatus: orders.fulfilmentStatus,
        currency: orders.currency,
        subtotalMinor: orders.subtotalMinor,
        discountTotalMinor: orders.discountTotalMinor,
        shippingTotalMinor: orders.shippingTotalMinor,
        taxTotalMinor: orders.taxTotalMinor,
        totalMinor: orders.grandTotalMinor,
        paymentStatus: orders.paymentStatus,
        cancelledAt: orders.cancelledAt,
      })
      .from(orders)
      .where(and(eq(orders.accountId, accountId), eq(orders.orderNumber, orderNumber)))
      .limit(1);

    // Do not issue item or fulfilment queries until owner-scoped lookup succeeds.
    if (!ownedOrder) return null;

    const [items, fulfilmentRows, history, paymentRows] = await Promise.all([
      database
        .select({
          productName: orderItems.productName,
          variantName: orderItems.variantName,
          sku: orderItems.sku,
          quantity: orderItems.quantity,
          unitPriceMinor: orderItems.unitPriceMinor,
          lineTotalMinor: orderItems.lineTotalMinor,
          productionStatus: orderItems.productionStatus,
          personalisation: orderItems.personalisation,
        })
        .from(orderItems)
        .where(eq(orderItems.orderId, ownedOrder.id)),
      database
        .select({
          status: fulfilments.status,
          carrier: fulfilments.provider,
          trackingNumber: fulfilments.trackingNumber,
          shippedAt: fulfilments.shippedAt,
          deliveredAt: fulfilments.deliveredAt,
        })
        .from(fulfilments)
        .where(eq(fulfilments.orderId, ownedOrder.id))
        .orderBy(desc(fulfilments.createdAt))
        .limit(1),
      database
        .select({ status: orderStatusHistory.newStatus, occurredAt: orderStatusHistory.createdAt })
        .from(orderStatusHistory)
        .where(eq(orderStatusHistory.orderId, ownedOrder.id))
        .orderBy(orderStatusHistory.createdAt),
      database
        .select({ paidAt: payments.paidAt })
        .from(payments)
        .where(and(eq(payments.orderId, ownedOrder.id), eq(payments.status, "paid")))
        .orderBy(desc(payments.paidAt))
        .limit(1),
    ]);

    return {
      order: {
        orderNumber: ownedOrder.orderNumber,
        createdAt: ownedOrder.createdAt,
        status: ownedOrder.status,
        fulfilmentStatus: ownedOrder.fulfilmentStatus,
        currency: ownedOrder.currency,
        subtotalMinor: ownedOrder.subtotalMinor,
        discountTotalMinor: ownedOrder.discountTotalMinor,
        shippingTotalMinor: ownedOrder.shippingTotalMinor,
        taxTotalMinor: ownedOrder.taxTotalMinor,
        totalMinor: ownedOrder.totalMinor,
        paymentStatus: ownedOrder.paymentStatus,
        cancelledAt: ownedOrder.cancelledAt,
      },
      items,
      fulfilment: fulfilmentRows[0] ?? null,
      paymentReceivedAt: paymentRows[0]?.paidAt ?? null,
      history,
    };
  }
}
