import "server-only";

import { getStripeClient } from "@/lib/backend/stripe";
import { getStripeEnv } from "@/lib/backend/stripe-env";
import { logStripeDevelopment, logStripeDevelopmentError } from "@/lib/backend/stripe-diagnostics";

import { DrizzleCheckoutAttemptRepository, type CheckoutAttemptRepository } from "../repositories/checkout-attempt-repository";
import type { CreateGuestCheckoutAttemptInput } from "../schemas/guest-checkout";
import { createGuestCheckoutAttemptSchema } from "../schemas/guest-checkout";
import { CanonicalProductMappingService } from "./canonical-product-mapping-service";
import { GuestCheckoutService } from "./guest-checkout-service";
import { GUEST_CHECKOUT_SHIPPING_MINOR } from "./guest-checkout-pricing";

export interface StripeCheckoutGateway {
  createSession(input: {
    customerEmail: string;
    checkoutReference: string;
    productName: string;
    unitAmountMinor: number;
    successUrl: string;
    cancelUrl: string;
  }): Promise<{ id: string; url: string; paymentIntentId?: string }>;
}

export class StripeSdkCheckoutGateway implements StripeCheckoutGateway {
  async createSession(input: Parameters<StripeCheckoutGateway["createSession"]>[0]) {
    const session = await getStripeClient().checkout.sessions.create({
      mode: "payment",
      customer_email: input.customerEmail,
      shipping_address_collection: { allowed_countries: ["GB"] },
      line_items: [
        {
          price_data: { currency: "gbp", product_data: { name: input.productName }, unit_amount: input.unitAmountMinor },
          quantity: 1,
        },
        {
          price_data: { currency: "gbp", product_data: { name: "UK delivery" }, unit_amount: GUEST_CHECKOUT_SHIPPING_MINOR },
          quantity: 1,
        },
      ],
      metadata: { checkoutReference: input.checkoutReference },
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
    });
    if (!session.url) throw new Error("Stripe did not return a Checkout URL.");
    return { id: session.id, url: session.url, paymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : undefined };
  }
}

export class StripeCheckoutService {
  private readonly attemptService: GuestCheckoutService;

  constructor(
    attemptRepository: CheckoutAttemptRepository = new DrizzleCheckoutAttemptRepository(),
    private readonly productMapping = new CanonicalProductMappingService(),
    private readonly stripeGateway: StripeCheckoutGateway = new StripeSdkCheckoutGateway(),
    private readonly getSiteUrl: () => string = () => getStripeEnv().NEXT_PUBLIC_SITE_URL,
  ) {
    this.attemptService = new GuestCheckoutService(attemptRepository);
  }

  async createSession(input: unknown, options: { accountId?: string | null } = {}) {
    const parsed = createGuestCheckoutAttemptSchema.parse(input);
    const product = await this.productMapping.resolve(parsed.configuration);
    logStripeDevelopment("checkout.stripe_service.input", { accountId: options.accountId ?? null, customerId: null });
    const attempt = await this.attemptService.createAttemptForProduct(parsed as CreateGuestCheckoutAttemptInput, product, options.accountId ?? null);
    logStripeDevelopment("checkout.attempt_created", { checkoutReference: attempt.checkoutReference, sku: attempt.sku, subtotalMinor: attempt.subtotalMinor, shippingMinor: attempt.shippingMinor, totalMinor: attempt.totalMinor });
    const siteUrl = this.getSiteUrl().replace(/\/$/, "");
    try {
      const session = await this.stripeGateway.createSession({
        customerEmail: parsed.customer.email,
        checkoutReference: attempt.checkoutReference,
        productName: product.productName,
        unitAmountMinor: product.unitAmountMinor,
        successUrl: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${siteUrl}/checkout/cancel`,
      });
      await this.attemptService.attachStripeIdentifiers(attempt.checkoutReference, session);
      logStripeDevelopment("checkout.session_attached", { checkoutReference: attempt.checkoutReference, checkoutSessionId: session.id, paymentIntentId: session.paymentIntentId ?? null });
      return { url: session.url, checkoutReference: attempt.checkoutReference };
    } catch (error) {
      logStripeDevelopmentError("checkout.session_creation_failed", error, { checkoutReference: attempt.checkoutReference });
      throw error;
    }
  }
}
