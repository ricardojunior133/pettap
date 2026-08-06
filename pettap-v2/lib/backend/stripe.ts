import "server-only";

import Stripe from "stripe";

import { getStripeEnv } from "./stripe-env";

let stripe: Stripe | undefined;

/** Lazily created so builds and non-payment routes need no Stripe credentials. */
export function getStripeClient() {
  if (stripe) return stripe;
  stripe = new Stripe(getStripeEnv().STRIPE_SECRET_KEY);
  return stripe;
}
