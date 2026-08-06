import { NextResponse } from "next/server";

import { StripePaymentProcessingService } from "@/features/guest-commerce/services/stripe-payment-processing-service";
import { getStripeClient } from "@/lib/backend/stripe";
import { isStripeConfigured } from "@/lib/backend/stripe-env";
import { logStripeDevelopment, logStripeDevelopmentError } from "@/lib/backend/stripe-diagnostics";
import { verifyStripeWebhookSignature } from "@/lib/backend/stripe-webhook";

export const runtime = "nodejs";

/**
 * Deliberately no session check: Stripe must be able to deliver a signed event.
 * The proxy explicitly allows this endpoint so Stripe can deliver signed events.
 */
export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    logStripeDevelopment("webhook.not_configured");
    return NextResponse.json({ error: "Payment processing is not enabled." }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    logStripeDevelopment("webhook.missing_signature");
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  const payload = await request.text();
  let event;
  try {
    event = verifyStripeWebhookSignature(getStripeClient(), payload, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (error) {
    logStripeDevelopmentError("webhook.invalid_signature", error);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  logStripeDevelopment("webhook.received", { stripeEventId: event.id, eventType: event.type, stripeLiveMode: event.livemode });
  if (event.type !== "checkout.session.completed") return NextResponse.json({ received: true, ignored: true });
  const session = event.data.object;
  try {
    const result = await new StripePaymentProcessingService().processCompletedCheckout({
      eventId: event.id,
      sessionId: session.id,
      paymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : undefined,
    });
    logStripeDevelopment("webhook.completed", { stripeEventId: event.id, stripeSessionId: session.id, paymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : null, duplicate: result.duplicate, ignored: "ignored" in result && Boolean(result.ignored) });
    return NextResponse.json({ received: true, duplicate: result.duplicate, ignored: "ignored" in result && Boolean(result.ignored) });
  } catch (error) {
    logStripeDevelopmentError("webhook.failed", error, { stripeEventId: event.id, stripeSessionId: session.id });
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 });
  }
}
