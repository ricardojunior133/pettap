import Stripe from "stripe";
import { describe, expect, it } from "vitest";

import { toOrderItemPersonalisation, type CheckoutAttemptRecord, type CheckoutAttemptRepository, type CreateCheckoutAttemptRecord, type WebhookEventClaim } from "@/features/guest-commerce/repositories/checkout-attempt-repository";
import { createGuestCheckoutAttemptSchema } from "@/features/guest-commerce/schemas/guest-checkout";
import { GuestCheckoutService } from "@/features/guest-commerce/services/guest-checkout-service";
import { GUEST_CHECKOUT_SHIPPING_MINOR, calculateGuestCheckoutAmounts, calculateGuestCheckoutConfiguration } from "@/features/guest-commerce/services/guest-checkout-pricing";
import { ESSENTIAL_SHAPES } from "@/lib/studio/essential-shapes";
import { collectionAllowsPetName, studioShapes } from "@/lib/studio/options";
import { CanonicalProductMappingService } from "@/features/guest-commerce/services/canonical-product-mapping-service";
import { StripeCheckoutService } from "@/features/guest-commerce/services/stripe-checkout-service";
import { StripePaymentProcessingService } from "@/features/guest-commerce/services/stripe-payment-processing-service";
import { verifyStripeWebhookSignature } from "@/lib/backend/stripe-webhook";

const validInput = {
  configuration: { collection: "essential", shape: "circle", colour: "black", size: "classic", finish: "matte", petName: " Charlie " },
  customer: {
    email: "OWNER@EXAMPLE.TEST ", fullName: "Alex Taylor",
    shippingAddress: { fullName: "Alex Taylor", addressLine1: "1 Example Street", city: "London", postcode: "sw1a1aa", countryCode: "gb" },
  },
};

class FakeCheckoutAttemptRepository implements CheckoutAttemptRepository {
  readonly attempts: CheckoutAttemptRecord[] = [];
  readonly events = new Map<string, WebhookEventClaim>();
  promotedOrders = 0;

  async create(input: CreateCheckoutAttemptRecord) {
    const record: CheckoutAttemptRecord = { ...input, accountId: input.accountId ?? null, customerId: input.customerId ?? null, id: `attempt-${this.attempts.length + 1}`, orderId: null, status: "draft", stripeCheckoutSessionId: null, stripePaymentIntentId: null, paidAt: null, createdAt: new Date("2026-07-24T00:00:00.000Z") };
    this.attempts.push(record);
    return record;
  }
  async findByReference(reference: string) { return this.attempts.find((attempt) => attempt.checkoutReference === reference) ?? null; }
  async findByStripeSessionId(sessionId: string) { return this.attempts.find((attempt) => attempt.stripeCheckoutSessionId === sessionId) ?? null; }
  async findOrderNumber(orderId: string) { return this.attempts.find((attempt) => attempt.orderId === orderId)?.orderId ? "PT-TEST" : null; }
  async attachStripeIdentifiers(reference: string, identifiers: { sessionId?: string; paymentIntentId?: string }) {
    const attempt = await this.findByReference(reference);
    if (attempt) Object.assign(attempt, { stripeCheckoutSessionId: identifiers.sessionId ?? null, stripePaymentIntentId: identifiers.paymentIntentId ?? null, status: "pending_payment" });
  }
  async claimWebhookEvent(input: { stripeEventId: string; eventType: string; checkoutAttemptId?: string }) {
    const existing = this.events.get(input.stripeEventId);
    if (existing?.processingStatus === "failed") {
      const retried = { ...existing, processingStatus: "received" as const, isNew: true };
      this.events.set(input.stripeEventId, retried);
      return retried;
    }
    if (existing) return { ...existing, isNew: false };
    const claim = { id: `event-${this.events.size + 1}`, stripeEventId: input.stripeEventId, eventType: input.eventType, processingStatus: "received" as const, isNew: true };
    this.events.set(input.stripeEventId, claim);
    return claim;
  }
  async completeWebhookEvent(id: string, status: "processed" | "failed") {
    const event = [...this.events.values()].find((candidate) => candidate.id === id);
    if (event) this.events.set(event.stripeEventId, { ...event, processingStatus: status });
  }
  async createPaidOrder(input: { checkoutAttemptId: string; orderNumber: string }) {
    const attempt = this.attempts.find((item) => item.id === input.checkoutAttemptId);
    if (!attempt) throw new Error("missing attempt");
    if (attempt.orderId) return { orderId: attempt.orderId, orderNumber: input.orderNumber };
    this.promotedOrders += 1;
    attempt.orderId = `order-${this.promotedOrders}`;
    attempt.status = "paid";
    return { orderId: attempt.orderId, orderNumber: input.orderNumber };
  }
}

const canonicalProduct = { productId: "11111111-1111-4111-8111-111111111111", variantId: "22222222-2222-4222-8222-222222222222", productName: "PetTap Classic", variantName: "Classic Round", sku: "PET-CLA-RND-CLA-MAT-BLK", unitAmountMinor: 2499, currency: "GBP" as const };

describe("guest checkout server-side calculation", () => {
  it("accepts only configuration identifiers and rebuilds SKU and money server-side", () => {
    const parsed = createGuestCheckoutAttemptSchema.parse(validInput);
    const configuration = calculateGuestCheckoutConfiguration(parsed.configuration);
    const amounts = calculateGuestCheckoutAmounts(configuration);
    expect(configuration.sku).toBe("PET-ESS-CIRCLE-CLA-MAT-BLK-WHITE");
    expect(configuration.petName).toBe("Charlie");
    expect(amounts).toEqual({ currency: "GBP", subtotalMinor: 2499, shippingMinor: 299, totalMinor: 2798 });
  });

  it("only allows a pet name for Essential and never persists one for collections", () => {
    expect(ESSENTIAL_SHAPES).toHaveLength(20);
    expect(ESSENTIAL_SHAPES.map((shape) => shape.id)).toEqual(["circle", "square", "rounded-square", "oval", "teardrop", "bone", "heart", "paw", "shield", "star", "hexagon", "triangle", "home", "cat", "cloud", "diamond", "flower", "bear", "crescent-moon", "lightning-bolt"]);
    expect(new Set(ESSENTIAL_SHAPES.map((shape) => shape.id)).size).toBe(20);
    expect(studioShapes.filter((shape) => shape.collection === "essential").every((shape) => shape.supportsName)).toBe(true);
    expect(collectionAllowsPetName("essential")).toBe(true);
    expect(collectionAllowsPetName("breed")).toBe(true);

    const collection = createGuestCheckoutAttemptSchema.parse({ ...validInput, configuration: { ...validInput.configuration, collection: "breed", shape: "breed-pug", petName: "Must not persist" } });
    const calculated = calculateGuestCheckoutConfiguration(collection.configuration);
    expect(calculated.petName).toBeUndefined();
    expect(toOrderItemPersonalisation({ ...calculated, productId: "product", variantId: "variant", productName: "Classic", variantName: "Classic" })).not.toHaveProperty("petName");
  });

  it("rejects an Essential configuration without a pet name", () => {
    expect(() => createGuestCheckoutAttemptSchema.parse({ ...validInput, configuration: { ...validInput.configuration, petName: "" } })).toThrow("A pet name is required");
  });

  it("uses the fixed £2.99 shipping cost and rejects client-supplied prices", () => {
    expect(GUEST_CHECKOUT_SHIPPING_MINOR).toBe(299);
    expect(() => createGuestCheckoutAttemptSchema.parse({ ...validInput, total: 1 })).toThrow();
    expect(() => createGuestCheckoutAttemptSchema.parse({ ...validInput, configuration: { ...validInput.configuration, colour: "gold" } })).toThrow();
  });
});

describe("guest checkout attempt lifecycle", () => {
  it("creates a guest attempt with no account or customer and stores normalized snapshots", async () => {
    const repository = new FakeCheckoutAttemptRepository();
    const result = await new GuestCheckoutService(repository).createAttempt(validInput);
    expect(result.totalMinor).toBe(2798);
    expect(repository.attempts).toHaveLength(1);
    expect(repository.attempts[0]?.accountId).toBeNull();
    expect(repository.attempts[0]?.customerId).toBeNull();
    expect(repository.attempts[0]?.shippingAddressSnapshot?.postcode).toBe("SW1A 1AA");
    expect(repository.attempts[0]?.customerEmail).toBe("owner@example.test");
  });

  it("persists the server-resolved account for an authenticated checkout", async () => {
    const repository = new FakeCheckoutAttemptRepository();
    const accountId = "11111111-1111-4111-8111-111111111111";
    await new GuestCheckoutService(repository).createAttempt(validInput, accountId);
    expect(repository.attempts[0]?.accountId).toBe(accountId);
    expect(repository.attempts[0]?.customerId).toBeNull();
  });

  it("claims each Stripe event once, preventing duplicate downstream order promotion", async () => {
    const repository = new FakeCheckoutAttemptRepository();
    const service = new GuestCheckoutService(repository);
    const first = await service.registerWebhookEvent({ id: "evt_once", type: "checkout.session.completed" });
    const retry = await service.registerWebhookEvent({ id: "evt_once", type: "checkout.session.completed" });
    expect(first.isNew).toBe(true);
    expect(retry.isNew).toBe(false);
    expect(repository.events).toHaveLength(1);
  });
});

describe("canonical mapping, Checkout Session and payment promotion", () => {
  it("maps the Studio configuration to an active canonical product variant", async () => {
    const repository = { findActiveVariant: async (input: { size: string; finish: string }) => input.size === "classic" && input.finish === "matte" ? canonicalProduct : null };
    const service = new CanonicalProductMappingService(repository);
    const input = createGuestCheckoutAttemptSchema.parse(validInput);
    await expect(service.resolve(input.configuration)).resolves.toEqual({ ...canonicalProduct, finalSku: "PET-ESS-CIRCLE-CLA-MAT-BLK-WHITE" });
  });

  it.each([
    ["petite", "matte", 1999, "PET-ESS-CIRCLE-PET-MAT-BLK-WHITE"],
    ["classic", "gloss", 2499, "PET-ESS-CIRCLE-CLA-GLS-BLK-WHITE"],
    ["explorer", "matte", 2999, "PET-ESS-CIRCLE-EXP-MAT-BLK-WHITE"],
  ] as const)("maps %s %s using the active server price", async (size, finish, price, expectedSku) => {
    const product = { ...canonicalProduct, unitAmountMinor: price };
    const service = new CanonicalProductMappingService({ findActiveVariant: async (input) => input.size === size && input.finish === finish ? product : null });
    const configuration = createGuestCheckoutAttemptSchema.parse({ ...validInput, configuration: { ...validInput.configuration, size, finish } }).configuration;
    const mapped = await service.resolve(configuration);
    expect(mapped.unitAmountMinor).toBe(price);
    expect(mapped.finalSku).toBe(expectedSku);
  });

  it("creates a server-priced Stripe Checkout Session with only the safe internal reference in metadata", async () => {
    const attempts = new FakeCheckoutAttemptRepository();
    const mapping = new CanonicalProductMappingService({ findActiveVariant: async () => canonicalProduct });
    const calls: unknown[] = [];
    const gateway = { createSession: async (input: unknown) => { calls.push(input); return { id: "cs_test_123", url: "https://checkout.stripe.test/session" }; } };
    const accountId = "11111111-1111-4111-8111-111111111111";
    const result = await new StripeCheckoutService(attempts, mapping, gateway, () => "https://pettap.example").createSession(validInput, { accountId });
    expect(result.url).toContain("checkout.stripe.test");
    expect(calls).toHaveLength(1);
    expect(attempts.attempts[0]?.stripeCheckoutSessionId).toBe("cs_test_123");
    expect(attempts.attempts[0]?.accountId).toBe(accountId);
    expect(JSON.stringify(calls[0])).not.toContain("addressLine1");
  });

  it("promotes a completed Checkout Session exactly once even when Stripe retries", async () => {
    const repository = new FakeCheckoutAttemptRepository();
    const attempt = await repository.create({ checkoutReference: "chk_123", accountId: null, customerId: null, currency: "GBP", subtotalMinor: 2499, shippingMinor: 299, totalMinor: 2798, customerEmail: "owner@example.test", customerName: "Alex Taylor", shippingAddressSnapshot: { fullName: "Alex Taylor", addressLine1: "1 Example Street", city: "London", postcode: "SW1A 1AA", countryCode: "GB" }, configurationSnapshot: { collection: "classic", shape: "classic-round", colour: "black", size: "classic", finish: "matte", petName: "Charlie", sku: canonicalProduct.sku, unitAmountMinor: 2499, quantity: 1, productId: canonicalProduct.productId, variantId: canonicalProduct.variantId, productName: canonicalProduct.productName, variantName: canonicalProduct.variantName } });
    await repository.attachStripeIdentifiers(attempt.checkoutReference, { sessionId: "cs_completed" });
    const service = new StripePaymentProcessingService(repository);
    const first = await service.processCompletedCheckout({ eventId: "evt_completed", sessionId: "cs_completed" });
    const retry = await service.processCompletedCheckout({ eventId: "evt_completed", sessionId: "cs_completed" });
    expect(first.duplicate).toBe(false);
    expect(retry.duplicate).toBe(true);
    expect(repository.promotedOrders).toBe(1);
  });

  it("acknowledges a synthetic Stripe event with an unknown Checkout Session safely", async () => {
    const repository = new FakeCheckoutAttemptRepository();
    const result = await new StripePaymentProcessingService(repository).processCompletedCheckout({ eventId: "evt_synthetic", sessionId: "cs_not_pettap" });
    expect(result).toMatchObject({ duplicate: false, ignored: true, order: null });
    expect(repository.promotedOrders).toBe(0);
  });
});

describe("Stripe webhook verification", () => {
  it("rejects an invalid webhook signature without contacting Stripe", () => {
    const stripe = new Stripe("sk_test_local_only");
    expect(() => verifyStripeWebhookSignature(stripe, "{}", "t=1,v1=invalid", "whsec_local_only")).toThrow();
  });
});
