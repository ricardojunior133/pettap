import "server-only";

import type Stripe from "stripe";

import { getStripeClient } from "./stripe";
import { getStripeEnv } from "./stripe-env";

export type StripeLogContext = Record<string, string | boolean | number | null | undefined>;

export function logStripeDevelopment(stage: string, context: StripeLogContext = {}) {
  if (process.env.NODE_ENV === "production") return;
  console.info("[stripe]", stage, context);
}

export function logStripeDevelopmentError(stage: string, error: unknown, context: StripeLogContext = {}) {
  if (process.env.NODE_ENV === "production") return;
  const details = error instanceof Error
    ? { name: error.name, message: error.message, stack: error.stack }
    : { message: "Unknown Stripe processing error." };
  console.error("[stripe]", stage, { ...context, ...details });
}

/** Makes one read-only Stripe API request and never returns a credential. */
export type StripeDiagnosticsClient = Pick<Stripe, "accounts">;

export async function getStripeDiagnostics(client: StripeDiagnosticsClient = getStripeClient()) {
  const env = getStripeEnv();
  const account = await client.accounts.retrieveCurrent();
  return {
    configured: true,
    keyMode: env.STRIPE_SECRET_KEY.startsWith("sk_test_") ? "test" : "live",
    accountId: account.id,
  } as const;
}
