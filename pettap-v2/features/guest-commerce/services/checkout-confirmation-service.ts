import "server-only";

import { getStripeClient } from "@/lib/backend/stripe";
import { isStripeConfigured } from "@/lib/backend/stripe-env";

import { DrizzleCheckoutAttemptRepository, type CheckoutAttemptRepository } from "../repositories/checkout-attempt-repository";

/** Safe confirmation lookup: verifies the opaque Stripe session before exposing an order number. */
export class CheckoutConfirmationService {
  constructor(private readonly repository: CheckoutAttemptRepository = new DrizzleCheckoutAttemptRepository()) {}

  async getPaidOrderNumber(sessionId: string) {
    if (!isStripeConfigured() || !sessionId.startsWith("cs_")) return null;
    const session = await getStripeClient().checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== "paid") return null;
    const attempt = await this.repository.findByStripeSessionId(session.id);
    return attempt?.orderId ? this.repository.findOrderNumber(attempt.orderId) : null;
  }
}
