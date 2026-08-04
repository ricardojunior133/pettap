import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const form = readFileSync("features/contact-requests/components/public-contact-request-form.tsx", "utf8");
const action = readFileSync("features/contact-requests/actions/contact-request-actions.ts", "utf8");
const actionHandler = readFileSync("features/contact-requests/actions/contact-request-action-handler.ts", "utf8");
const page = readFileSync("app/nfc/v1/t/[publicCode]/page.tsx", "utf8");

describe("public finder contact form", () => {
  it("is only rendered from the Lost resolver branch", () => {
    expect(page).toContain('if(r.state==="lost")');
    expect(page).toContain("PublicContactRequestForm");
    expect(page).not.toContain("PublicContactRequestForm publicCode={r.profile");
  });

  it("has explicit name, email, message and consent fields with pending prevention and feedback", () => {
    for (const field of ["finderName", "finderEmail", "message", "consent"]) expect(form).toContain(`name="${field}"`);
    expect(form).toContain('type="email"');
    expect(form).toContain('type="checkbox"');
    expect(form).toContain('value="accepted"');
    expect(form).toContain('name="website"');
    expect(form).toContain("disabled={pending}");
    expect(form).toContain('aria-live="polite"');
    expect(form).toContain("Sending…");
    expect(actionHandler).toContain("Your message has been sent to the pet owner.");
  });

  it("does not render owner data or internal records", () => {
    expect(form).not.toMatch(/ownerEmail|ownerPhone|address|actorHash|lostReportId|tagId|petId|details/i);
    expect(form).toContain('name="publicCode"');
  });

  it("uses the canonical action, strict schema, same-origin and private honeypot handling", () => {
    expect(action).toContain("submitContactRequestAction");
    expect(actionHandler).toContain("createContactRequestSchema.parse");
    expect(actionHandler).toContain("finderEmail");
    expect(actionHandler).toContain("consent");
    expect(action).toContain("isSameOriginRequest");
    expect(actionHandler).toContain("recordInvalidAttempt");
    expect(actionHandler).toContain("createService");
    expect(actionHandler).not.toMatch(/phone|actorHash|lostReportId|tagId|petId/);
  });

  it("does not initialize notification dependencies during SSR module evaluation", () => {
    expect(action).not.toContain("new ContactRequestService()");
    expect(action).toContain("runContactRequestAction");
    expect(actionHandler).toContain("createService(diagnostics)");
  });

  it("keeps user-facing failures generic", () => {
    expect(actionHandler).toContain("We couldn't submit your request.");
    expect(actionHandler).not.toContain("database");
  });
});
