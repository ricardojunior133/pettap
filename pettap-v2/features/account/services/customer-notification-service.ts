import "server-only";

import { getAuthenticatedAccountId } from "@/features/commerce/services/commerce-account-service";

import {
  DrizzleCustomerNotificationRepository,
  type CustomerNotificationRecord,
  type CustomerNotificationRepository,
} from "../repositories/customer-notification-repository";

export type CustomerNotificationStatus = "Sent" | "Processing" | "Failed" | "Not sent";
export type CustomerNotificationType =
  | "Payment received"
  | "Production started"
  | "Printed"
  | "Packed"
  | "Shipped"
  | "Delivered"
  | "Order cancelled"
  | "Order update";

export type CustomerNotificationDto = {
  type: CustomerNotificationType;
  title: CustomerNotificationType;
  description: string;
  orderNumber: string;
  status: CustomerNotificationStatus;
  createdAt: string;
  sentAt: string | null;
};

export type CustomerNotificationsPageViewModel = {
  notifications: CustomerNotificationDto[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type CustomerNotificationsQuery = { page?: number };

const pageSize = 12;

const notificationCopy: Record<string, Pick<CustomerNotificationDto, "type" | "title" | "description">> = {
  payment_received: {
    type: "Payment received",
    title: "Payment received",
    description: "We received your payment and confirmed your order.",
  },
  production_started: {
    type: "Production started",
    title: "Production started",
    description: "Your personalised PetTap is now being prepared.",
  },
  printed: {
    type: "Printed",
    title: "Printed",
    description: "Your PetTap has moved through production.",
  },
  packed: {
    type: "Packed",
    title: "Packed",
    description: "Your order has been carefully packed.",
  },
  shipped: {
    type: "Shipped",
    title: "Shipped",
    description: "Your order is on its way.",
  },
  delivered: {
    type: "Delivered",
    title: "Delivered",
    description: "Your order has been delivered.",
  },
  order_cancelled: {
    type: "Order cancelled",
    title: "Order cancelled",
    description: "Your order has been cancelled.",
  },
};

function publicStatus(status: CustomerNotificationRecord["status"]): CustomerNotificationStatus {
  if (status === "sent") return "Sent";
  if (status === "pending") return "Processing";
  if (status === "failed") return "Failed";
  return "Not sent";
}

export function toCustomerNotificationDto(record: CustomerNotificationRecord): CustomerNotificationDto {
  const copy = notificationCopy[record.notificationType] ?? {
    type: "Order update" as const,
    title: "Order update" as const,
    description: "There is an update about your order.",
  };

  return {
    ...copy,
    orderNumber: record.orderNumber,
    status: publicStatus(record.status),
    createdAt: record.createdAt.toISOString(),
    sentAt: record.sentAt?.toISOString() ?? null,
  };
}

export class CustomerNotificationService {
  constructor(
    private readonly repository: CustomerNotificationRepository = new DrizzleCustomerNotificationRepository(),
    private readonly resolveAccountId: () => Promise<string> = getAuthenticatedAccountId,
  ) {}

  async listNotifications({ page = 1 }: CustomerNotificationsQuery = {}): Promise<CustomerNotificationsPageViewModel> {
    const safePage = Number.isInteger(page) && page > 0 ? page : 1;
    const result = await this.repository.listByAccount(await this.resolveAccountId(), { page: safePage, pageSize });

    return {
      notifications: result.rows.map(toCustomerNotificationDto),
      page: safePage,
      pageSize,
      total: result.total,
      totalPages: Math.ceil(result.total / pageSize),
    };
  }
}
