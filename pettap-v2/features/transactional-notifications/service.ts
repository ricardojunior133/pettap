import "server-only";

import { getServerEnv } from "@/lib/backend/env";

import { getTransactionalNotificationProvider } from "./provider-resolver";
import { DrizzleTransactionalNotificationRepository, type TransactionalNotificationRepository } from "./repository";
import { renderTransactionalEmail } from "./templates";
import type { NotificationProvider, TransactionalNotificationEvent } from "./types";

export type TransactionalNotificationResult =
  | { outcome: "sent"; notificationId: string }
  | { outcome: "failed"; notificationId: string }
  | { outcome: "skipped"; reason: "already_processed" | "order_not_found" };

/**
 * Runs only after an order operation commits. Provider failures are persisted
 * and converted to a result, so they never roll back payment or fulfilment.
 */
export class TransactionalNotificationService {
  constructor(
    private readonly repository: TransactionalNotificationRepository = new DrizzleTransactionalNotificationRepository(),
    private readonly provider: NotificationProvider = getTransactionalNotificationProvider(),
    private readonly siteUrl = getServerEnv().NEXT_PUBLIC_SITE_URL,
    private readonly supportEmail = process.env.EMAIL_SUPPORT || process.env.NEXT_PUBLIC_CONTACT_EMAIL || "support@pettap.co.uk",
  ) {}

  async sendTransactionalNotification(input: { orderId: string; type: TransactionalNotificationEvent }): Promise<TransactionalNotificationResult> {
    const existing = await this.repository.findByOrderAndType(input.orderId, input.type);
    if (existing) return { outcome: "skipped", reason: "already_processed" };

    const context = await this.repository.getOrderContext(input.orderId);
    if (!context) return { outcome: "skipped", reason: "order_not_found" };

    const email = renderTransactionalEmail(input.type, context.customerEmail, {
      orderNumber: context.orderNumber,
      petName: context.petName,
      summary: context.summary,
      accountUrl: new URL(`/dashboard/orders/${context.id}`, this.siteUrl).toString(),
      orderTrackingUrl: new URL(`/track/${context.orderNumber}`, this.siteUrl).toString(),
      carrierTrackingUrl: context.trackingUrl,
      carrier: context.carrier,
      trackingNumber: context.trackingNumber,
    }, { supportEmail: this.supportEmail });
    const pending = await this.repository.createPending({
      orderId: context.id,
      accountId: context.accountId,
      notificationType: input.type,
      recipient: email.to,
      subject: email.subject,
      payload: email.payload,
      provider: this.provider.name,
    });
    if (!pending) return { outcome: "skipped", reason: "already_processed" };

    try {
      const result = await this.provider.send(email);
      await this.repository.markSent(pending.id, result.providerMessageId);
      return { outcome: "sent", notificationId: pending.id };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown notification provider failure.";
      await this.repository.markFailed(pending.id, message);
      return { outcome: "failed", notificationId: pending.id };
    }
  }
}
