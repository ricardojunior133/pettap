import "server-only";

import { and, count, desc, eq, sql } from "drizzle-orm";

import { fulfilments, orderItems, orders } from "@/db/schema";
import { createDatabaseClient } from "@/lib/backend/db";

import type { FulfilmentStatus, OrderStatus } from "../types/commerce";

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

export interface OrderRepository {
  listOrders(accountId: string, pagination: CustomerOrderPagination): Promise<CustomerOrderPage>;
  getOrderByNumber(accountId: string, orderNumber: string): Promise<CustomerOrderReadRecord | null>;
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
}
