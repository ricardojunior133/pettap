import { describe, expect, it } from "vitest";

import { resolveContactNotificationProvider } from "@/features/contact-request-notifications/provider-factory";
import { ConsoleContactNotificationProvider } from "@/features/contact-request-notifications/providers/console-contact-notification-provider";
import { ResendContactNotificationProvider, type ResendContactNotificationClient } from "@/features/contact-request-notifications/providers/resend-contact-notification-provider";
import type { ContactNotificationEmail, ContactNotificationProvider } from "@/features/contact-request-notifications/types";

const email: ContactNotificationEmail = { to: "owner@example.test", subject: "Someone may have found your pet", html: "<p>Safe</p>", text: "Safe", idempotencyKey: "contact-request-notification:abc" };

describe("contact request delivery providers", () => {
  it("uses console in development and an injected fake in test", () => {
    const fake: ContactNotificationProvider = { name: "fake", send: async () => ({ providerMessageId: "fake" }) };
    expect(resolveContactNotificationProvider("development", {}).name).toBe("console");
    expect(resolveContactNotificationProvider("test", {}, fake)).toBe(fake);
    expect(resolveContactNotificationProvider("production", {}).name).toBe("unconfigured");
    expect(resolveContactNotificationProvider("production", { RESEND_API_KEY: "test-key", EMAIL_FROM: "PetTap <hello@pettap.co.uk>" }).name).toBe("resend");
  });

  it("sends the exact idempotency key and reply-to through the Resend SDK adapter", async () => {
    const calls: unknown[][] = [];
    const client = { emails: { send: async (...args: unknown[]) => { calls.push(args); return { data: { id: "resend-message" }, error: null }; } } } as unknown as ResendContactNotificationClient;
    const provider = new ResendContactNotificationProvider({ apiKey: "test-key", from: "PetTap <hello@pettap.co.uk>", replyTo: "support@pettap.co.uk" }, client);
    await expect(provider.send(email)).resolves.toEqual({ providerMessageId: "resend-message" });
    expect(calls[0][0]).toMatchObject({ from: "PetTap <hello@pettap.co.uk>", to: email.to, replyTo: "support@pettap.co.uk", subject: email.subject, html: email.html, text: email.text });
    expect(calls[0][1]).toEqual({ idempotencyKey: email.idempotencyKey });
  });

  it("initializes the production adapter without evaluating a parameter property too early", () => {
    expect(() => new ResendContactNotificationProvider({ apiKey: "test-key", from: "PetTap <hello@pettap.co.uk>" })).not.toThrow();
  });

  it("does not expose a real recipient or body through the Console provider log", async () => {
    const log = console.info; const calls: unknown[][] = []; console.info = (...args: unknown[]) => { calls.push(args); };
    try { await new ConsoleContactNotificationProvider().send(email); } finally { console.info = log; }
    expect(JSON.stringify(calls)).not.toContain(email.to); expect(JSON.stringify(calls)).not.toContain(email.html); expect(JSON.stringify(calls)).not.toContain(email.text);
  });
});
