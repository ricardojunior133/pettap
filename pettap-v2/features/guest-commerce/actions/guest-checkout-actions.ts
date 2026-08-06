"use server";

import { headers } from "next/headers";

import { getOptionalCheckoutAccountId, GuestCheckoutService } from "../services/guest-checkout-service";
import { StripeCheckoutService } from "../services/stripe-checkout-service";
import { logStripeDevelopment } from "@/lib/backend/stripe-diagnostics";
import { clientRequestKey, checkRateLimit } from "@/lib/security/rate-limit";
import { isSameOriginRequest } from "@/lib/security/same-origin";

async function assertCheckoutRequest() {
  const requestHeaders = await headers();
  const rate = checkRateLimit(clientRequestKey(requestHeaders, "checkout:start"), { limit: 20, windowMs: 10 * 60_000 });
  if (!rate.allowed || !await isSameOriginRequest()) throw new Error("Checkout is temporarily unavailable. Please try again shortly.");
  return requestHeaders;
}

/** Not wired to a public UI until Sprint 18B exposes the reviewed checkout flow. */
export async function createGuestCheckoutAttempt(input: unknown) {
  await assertCheckoutRequest();
  const accountId = await getOptionalCheckoutAccountId();
  logStripeDevelopment("checkout.action.create_attempt", { accountId, authenticated: Boolean(accountId) });
  return new GuestCheckoutService().createAttempt(input, accountId);
}

/** Creates a Stripe-hosted Checkout Session; the browser receives only its URL. */
export async function startStripeCheckout(input: unknown) {
  const requestHeaders = await assertCheckoutRequest();
  const accountId = await getOptionalCheckoutAccountId();
  logStripeDevelopment("checkout.action.start", { accountId, authenticated: Boolean(accountId) });
  const origin = requestHeaders.get("origin");
  const localReturnUrl = process.env.NODE_ENV === "development" && origin
    ? (() => {
        try {
          const url = new URL(origin);
          return ["localhost", "127.0.0.1"].includes(url.hostname) ? url.origin : null;
        } catch {
          return null;
        }
      })()
    : null;
  const service = localReturnUrl
    ? new StripeCheckoutService(undefined, undefined, undefined, () => localReturnUrl)
    : new StripeCheckoutService();
  return service.createSession(input, { accountId });
}
