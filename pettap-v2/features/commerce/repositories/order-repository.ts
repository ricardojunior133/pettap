import "server-only";

import { and, desc, eq } from "drizzle-orm";

import { orders } from "@/db/schema";
import { createDatabaseClient } from "@/lib/backend/db";

import type { OrderSummary } from "../types/commerce";

function toSummary(order: typeof orders.$inferSelect): OrderSummary {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    paymentStatus: order.paymentStatus,
    fulfilmentStatus: order.fulfilmentStatus,
    currency: order.currency,
    grandTotalMinor: order.grandTotalMinor,
    createdAt: order.createdAt.toISOString(),
  };
}

export interface OrderRepository {
  listByAccountId(accountId: string): Promise<OrderSummary[]>;
  findByOrderNumber(accountId: string, orderNumber: string): Promise<OrderSummary | null>;
}

export class DrizzleOrderRepository implements OrderRepository {
  async listByAccountId(accountId: string): Promise<OrderSummary[]> {
    const database = createDatabaseClient();
    const results = await database.select().from(orders).where(eq(orders.accountId, accountId)).orderBy(desc(orders.createdAt));
    return results.map(toSummary);
  }

  async findByOrderNumber(accountId: string, orderNumber: string): Promise<OrderSummary | null> {
    const database = createDatabaseClient();
    const [result] = await database
      .select()
      .from(orders)
      .where(and(eq(orders.accountId, accountId), eq(orders.orderNumber, orderNumber)))
      .limit(1);
    return result ? toSummary(result) : null;
  }
}
