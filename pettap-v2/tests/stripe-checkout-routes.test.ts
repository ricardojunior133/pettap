import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const proxy = readFileSync(resolve(root, "proxy.ts"), "utf8");
const success = readFileSync(resolve(root, "app/checkout/success/page.tsx"), "utf8");
const cancel = readFileSync(resolve(root, "app/checkout/cancel/page.tsx"), "utf8");

describe("Stripe Checkout public route contract", () => {
  it("keeps checkout behind Coming Soon while allowing only the technical webhook", () => {
    expect(proxy).toContain('"/api/stripe/webhook"');
    for (const path of ["/checkout", "/checkout/success", "/checkout/cancel"]) expect(proxy).not.toContain(`"${path}"`);
    expect(proxy).not.toContain('"/api",');
  });

  it("keeps success and cancellation messages clear without exposing payment identifiers", () => {
    expect(success).toContain("Thank you for your order.");
    expect(success).not.toContain("payment_intent");
    expect(cancel).toContain("No payment was taken.");
    expect(cancel).toContain('href="/studio"');
  });
});
