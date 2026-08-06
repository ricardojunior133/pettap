import "server-only";

import { randomUUID } from "node:crypto";

import { logStripeDevelopment, logStripeDevelopmentError } from "@/lib/backend/stripe-diagnostics";
import { TransactionalNotificationService } from "@/features/transactional-notifications/service";

import {
  DrizzleCheckoutAttemptRepository,
  type CheckoutAttemptRepository,
} from "../repositories/checkout-attempt-repository";

export interface CompletedStripeCheckout {
  eventId: string;
  sessionId: string;
  paymentIntentId?: string;
}

export class StripePaymentProcessingService {
  constructor(
    private readonly repository: CheckoutAttemptRepository =
      new DrizzleCheckoutAttemptRepository(),
  ) {}

  async processCompletedCheckout(input: CompletedStripeCheckout) {
    // Resolve the local attempt before recording the event so the immutable
    // idempotency ledger retains the safe foreign-key link when one exists.
    // An unknown Stripe CLI fixture remains harmless and is recorded below.
    const attempt = await this.repository.findByStripeSessionId(input.sessionId);
    const event = await this.repository.claimWebhookEvent({
      stripeEventId: input.eventId,
      eventType: "checkout.session.completed",
      checkoutAttemptId: attempt?.id,
    });

    if (!event.isNew) {
      logStripeDevelopment("webhook.duplicate", { stripeEventId: input.eventId, stripeSessionId: input.sessionId });
      return {
        duplicate: true,
        order: null,
      };
    }

    if (!attempt) {
      await this.repository.completeWebhookEvent(event.id, "processed", "checkout_attempt_not_found");
      logStripeDevelopment("webhook.ignored_unknown_session", { stripeEventId: input.eventId, stripeSessionId: input.sessionId });
      return { duplicate: false, order: null, ignored: true };
    }

    logStripeDevelopment("webhook.attempt_found", { checkoutReference: attempt.checkoutReference, checkoutAttemptId: attempt.id, stripeEventId: input.eventId, stripeSessionId: input.sessionId, paymentIntentId: input.paymentIntentId ?? null });

    try {
      const order = await this.repository.createPaidOrder({
        checkoutAttemptId: attempt.id,
        orderNumber: `PT-${randomUUID()
          .replaceAll("-", "")
          .slice(0, 12)
          .toUpperCase()}`,
        stripeSessionId: input.sessionId,
        stripePaymentIntentId: input.paymentIntentId,
      });

      await this.repository.completeWebhookEvent(
        event.id,
        "processed",
      );

      if (order) {
        // Notification persistence is deliberately best-effort after the
        // completed payment transaction. It must never change Stripe's ACK.
        try {
          await new TransactionalNotificationService().sendTransactionalNotification({
            orderId: order.orderId,
            type: "payment_received",
          });
        } catch (notificationError) {
          logStripeDevelopmentError("webhook.payment_notification_failed", notificationError, {
            orderId: order.orderId,
            stripeEventId: input.eventId,
          });
        }
      }

      return {
        duplicate: false,
        order,
      };
    } catch (error) {
      logStripeDevelopmentError("webhook.order_promotion_failed", error, { checkoutReference: attempt.checkoutReference, checkoutAttemptId: attempt.id, stripeEventId: input.eventId, stripeSessionId: input.sessionId });

      await this.repository.completeWebhookEvent(
        event.id,
        "failed",
        "order_promotion_failed",
      );

      throw error;
    }
  }
}
