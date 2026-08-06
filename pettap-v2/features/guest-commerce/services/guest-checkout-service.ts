import "server-only";

import { randomUUID } from "node:crypto";

import type { AddressSnapshot, GuestCheckoutConfigurationSnapshot } from "@/db/schema";
import { getCurrentUser } from "@/lib/backend/auth/get-current-user";
import { ensureAccountProfile } from "@/features/owner/services/profile-service";
import { logStripeDevelopment } from "@/lib/backend/stripe-diagnostics";

import type { CreateGuestCheckoutAttemptInput } from "../schemas/guest-checkout";
import { createGuestCheckoutAttemptSchema } from "../schemas/guest-checkout";
import { type CheckoutAttemptRecord, DrizzleCheckoutAttemptRepository, type CheckoutAttemptRepository, type WebhookEventClaim } from "../repositories/checkout-attempt-repository";
import { calculateGuestCheckoutAmounts, calculateGuestCheckoutConfiguration } from "./guest-checkout-pricing";
import type { ResolvedProductMapping } from "./canonical-product-mapping-service";

export interface CreateCheckoutAttemptResult {
  checkoutReference: string;
  currency: "GBP";
  subtotalMinor: number;
  shippingMinor: number;
  totalMinor: number;
  sku: string;
}

/** Resolves the account only on the server; browser input never supplies it. */
export async function getOptionalCheckoutAccountId(): Promise<string | null> {
  const user = await getCurrentUser();
  if (!user) {
    logStripeDevelopment("checkout.auth.session", { sessionExists: false, userId: null, accountId: null });
    return null;
  }
  await ensureAccountProfile({ authUserId: user.id, email: user.email, userMetadata: user.user_metadata });
  logStripeDevelopment("checkout.auth.session", { sessionExists: true, userId: user.id, accountId: user.id });
  return user.id;
}

function toAddressSnapshot(input: CreateGuestCheckoutAttemptInput["customer"]["shippingAddress"]): AddressSnapshot {
  return input;
}

/**
 * The sole entry point for guest checkout data. The browser submits only
 * identifiers and contact details; all monetary values and SKU are rebuilt here.
 */
export class GuestCheckoutService {
  constructor(private readonly repository: CheckoutAttemptRepository = new DrizzleCheckoutAttemptRepository()) {}

  async createAttempt(input: unknown, accountId: string | null = null): Promise<CreateCheckoutAttemptResult> {
    const parsed = createGuestCheckoutAttemptSchema.parse(input);
    const configuration = calculateGuestCheckoutConfiguration(parsed.configuration);
    return this.createValidatedAttempt(parsed, configuration, accountId);
  }

  async createAttemptForProduct(input: unknown, product: ResolvedProductMapping, accountId: string | null = null): Promise<CreateCheckoutAttemptResult> {
    const parsed = createGuestCheckoutAttemptSchema.parse(input);
    const configuration = {
      ...calculateGuestCheckoutConfiguration(parsed.configuration),
      sku: product.finalSku,
      unitAmountMinor: product.unitAmountMinor,
      productId: product.productId,
      variantId: product.variantId,
      productName: product.productName,
      variantName: product.variantName,
    } satisfies GuestCheckoutConfigurationSnapshot;
    return this.createValidatedAttempt(parsed, configuration, accountId);
  }

  private async createValidatedAttempt(
    parsed: CreateGuestCheckoutAttemptInput,
    configuration: GuestCheckoutConfigurationSnapshot,
    accountId: string | null,
  ): Promise<CreateCheckoutAttemptResult> {
    const amounts = calculateGuestCheckoutAmounts(configuration);
    const checkoutReference = `chk_${randomUUID().replaceAll("-", "")}`;
    logStripeDevelopment("checkout.attempt.service_input", { checkoutReference, accountId, customerId: null });

    const created = await this.repository.create({
      checkoutReference,
      accountId,
      customerId: null,
      currency: amounts.currency,
      subtotalMinor: amounts.subtotalMinor,
      shippingMinor: amounts.shippingMinor,
      totalMinor: amounts.totalMinor,
      customerEmail: parsed.customer.email,
      customerName: parsed.customer.fullName,
      shippingAddressSnapshot: toAddressSnapshot(parsed.customer.shippingAddress),
      configurationSnapshot: configuration,
    });
    const reread = await this.repository.findByReference(checkoutReference);
    logStripeDevelopment("checkout.attempt.persisted", { checkoutReference, createdAccountId: created.accountId, rereadAccountId: reread?.accountId ?? null, createdCustomerId: created.customerId, rereadFound: Boolean(reread) });

    return { checkoutReference, ...amounts, sku: configuration.sku };
  }

  async registerWebhookEvent(event: { id: string; type: string; checkoutReference?: string }): Promise<WebhookEventClaim> {
    const attempt = event.checkoutReference ? await this.repository.findByReference(event.checkoutReference) : null;
    const claim = await this.repository.claimWebhookEvent({ stripeEventId: event.id, eventType: event.type, checkoutAttemptId: attempt?.id });
    return claim;
  }

  async attachStripeIdentifiers(checkoutReference: string, identifiers: { id: string; paymentIntentId?: string }) {
    await this.repository.attachStripeIdentifiers(checkoutReference, {
      sessionId: identifiers.id,
      paymentIntentId: identifiers.paymentIntentId,
    });
  }

  async linkToAccountLater(checkoutReference: string, accountId: string, customerId: string): Promise<CheckoutAttemptRecord | null> {
    // Association is intentionally deferred to a future authenticated service.
    // This method is a contract placeholder and never accepts identifiers from a browser action.
    void accountId;
    void customerId;
    return this.repository.findByReference(checkoutReference);
  }
}
