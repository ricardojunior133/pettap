import "server-only";

import { and, count, desc, eq } from "drizzle-orm";

import { orders, transactionalNotifications } from "@/db/schema";
import { createDatabaseClient } from "@/lib/backend/db";

export type CustomerNotificationRecord = {
  notificationType: string;
  orderNumber: string;
  status: "pending" | "sent" | "failed";
  createdAt: Date;
  sentAt: Date | null;
};

export type CustomerNotificationPage = {
  rows: CustomerNotificationRecord[];
  total: number;
};

export type CustomerNotificationPagination = {
  page: number;
  pageSize: number;
};

export interface CustomerNotificationRepository {
  listByAccount(accountId: string, pagination: CustomerNotificationPagination): Promise<CustomerNotificationPage>;
}

/**
 * Read-only notification history. Ownership is proven through the order, not
 * a client-provided identifier and not the notification's nullable account id.
 */
export class DrizzleCustomerNotificationRepository implements CustomerNotificationRepository {
  async listByAccount(accountId: string, { page, pageSize }: CustomerNotificationPagination): Promise<CustomerNotificationPage> {
    const database = createDatabaseClient();
    const where = and(
      eq(orders.accountId, accountId),
      eq(transactionalNotifications.orderId, orders.id),
    );

    const [rows, totalResult] = await Promise.all([
      database
        .select({
          notificationType: transactionalNotifications.notificationType,
          orderNumber: orders.orderNumber,
          status: transactionalNotifications.status,
          createdAt: transactionalNotifications.createdAt,
          sentAt: transactionalNotifications.sentAt,
        })
        .from(transactionalNotifications)
        .innerJoin(orders, eq(transactionalNotifications.orderId, orders.id))
        .where(where)
        .orderBy(desc(transactionalNotifications.createdAt), desc(orders.orderNumber))
        .limit(pageSize)
        .offset((page - 1) * pageSize),
      database
        .select({ value: count() })
        .from(transactionalNotifications)
        .innerJoin(orders, eq(transactionalNotifications.orderId, orders.id))
        .where(where),
    ]);

    return {
      rows: rows.map((row) => ({
        ...row,
        status: row.status as CustomerNotificationRecord["status"],
      })),
      total: Number(totalResult[0]?.value ?? 0),
    };
  }
}
