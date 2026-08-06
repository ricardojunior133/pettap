import "server-only";

import { z } from "zod";

const stripeEnvSchema = z.object({
  STRIPE_SECRET_KEY: z.string().min(1),
  STRIPE_WEBHOOK_SECRET: z.string().min(1),
  NEXT_PUBLIC_SITE_URL: z.url(),
});

export type StripeEnv = z.infer<typeof stripeEnvSchema>;

/** Stripe is optional until payment processing is deliberately enabled. */
export function isStripeConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET);
}

export function getStripeEnv(): StripeEnv {
  return stripeEnvSchema.parse({
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  });
}
