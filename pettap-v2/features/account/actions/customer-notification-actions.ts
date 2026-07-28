"use server";

import { CustomerNotificationService } from "../services/customer-notification-service";

/** Read-only action; the account is always resolved from the server session. */
export async function getCustomerNotifications(page?: number) {
  return new CustomerNotificationService().listNotifications({ page });
}
