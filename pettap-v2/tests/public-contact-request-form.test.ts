import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const form=readFileSync("features/contact-requests/components/public-contact-request-form.tsx","utf8");
const action=readFileSync("features/contact-requests/actions/contact-request-actions.ts","utf8");
const page=readFileSync("app/nfc/v1/t/[publicCode]/page.tsx","utf8");

describe("public finder contact form",()=>{
  it("is only rendered from the Lost resolver branch",()=>{expect(page).toContain('if(r.state==="lost")');expect(page).toContain("PublicContactRequestForm");expect(page).not.toContain("PublicContactRequestForm publicCode={r.profile")});
  it("has minimal accessible fields, pending prevention and feedback",()=>{for(const field of ["finderName","finderContact","message"])expect(form).toContain(`name=\"${field}\"`);expect(form).toContain('name="website"');expect(form).toContain("disabled={pending}");expect(form).toContain('aria-live="polite"');expect(form).toContain("Sending…");expect(action).toContain("Your message has been sent to the pet owner.")});
  it("does not render owner data or internal records",()=>{expect(form).not.toMatch(/ownerEmail|ownerPhone|address|actorHash|lostReportId|tagId|petId|details/i);expect(form).toContain('name="publicCode"')});
  it("uses the canonical action, strict schema, same-origin and private honeypot handling",()=>{expect(action).toContain("submitContactRequestAction");expect(action).toContain("createContactRequestSchema.parse");expect(action).toContain("isSameOriginRequest");expect(action).toContain("recordInvalidAttempt");expect(action).toContain("ContactRequestService");expect(action).not.toMatch(/email|phone|actorHash|lostReportId|tagId|petId/)});
  it("keeps user-facing failures generic",()=>{expect(action).toContain("We couldn't submit your request.");expect(action).not.toContain("ContactRequestError");expect(action).not.toContain("database")});
});
