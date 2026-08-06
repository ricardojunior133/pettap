import "server-only";

import type Stripe from "stripe";

/** Kept separate so signature verification is testable without a network call. */
export function verifyStripeWebhookSignature(
  stripe: Stripe,
  rawPayload: string,
  signature: string,
  webhookSecret: string,
) {
  return stripe.webhooks.constructEvent(rawPayload, signature, webhookSecret);
}
