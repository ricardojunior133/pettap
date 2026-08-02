import { describe, expect, it } from "vitest";

import { clearRateLimitStateForTests } from "@/lib/security/rate-limit";
import { allowFinderContact } from "@/features/contact-requests/contact-request-rate-limit";
import type { ContactRequestAudit, ContactRequestCreateResult, ContactRequestRecord, ContactRequestRepository, NewContactRequest } from "@/features/contact-requests/repositories/contact-request-repository";
import { ContactRequestService } from "@/features/contact-requests/services/contact-request-service";
import { createContactRequestSchema } from "@/features/contact-requests/schemas/contact-request";
import type { PublicTagRecord } from "@/features/nfc/repositories/public-tag-repository";

const tag: PublicTagRecord = { tagId: "33333333-3333-4333-8333-333333333333", status: "lost", accountId: "11111111-1111-4111-8111-111111111111", petId: "22222222-2222-4222-8222-222222222222", pet: { id: "22222222-2222-4222-8222-222222222222", accountId: "11111111-1111-4111-8111-111111111111", name: "Private pet", species: "Dog", publicProfileEnabled: true, archivedAt: null }, preferences: null, photoPath: null, activationCount: 1, lostReport: { id: "44444444-4444-4444-8444-444444444444", petId: "22222222-2222-4222-8222-222222222222", tagId: "33333333-3333-4333-8333-333333333333", openedAt: new Date(), status: "open" } };
const record: ContactRequestRecord = { id: "55555555-5555-4555-8555-555555555555", lostReportId: tag.lostReport!.id, petId: tag.pet!.id, tagId: tag.tagId, status: "pending", createdAt: new Date() };

class FakeRepository implements ContactRequestRepository {
  created: NewContactRequest[] = [];
  audits: ContactRequestAudit[] = [];
  fail = false;
  reuseExisting = false;

  async createContactRequest(input: NewContactRequest): Promise<ContactRequestCreateResult> {
    if (this.fail) throw new Error("transaction rolled back");
    if (this.reuseExisting) return { record, created: false };
    this.created.push(input);
    return { record, created: true };
  }
  async findPending() { return []; }
  async markDelivered() { return false; }
  async close() { return false; }
  async expire() { return false; }
  async recordAudit(event: ContactRequestAudit) { this.audits.push(event); }
}

class FakeNotifier {
  queued = new Set<string>();
  async enqueueForContactRequest(id: string) { this.queued.add(id); return { outcome: "queued" }; }
}

function service(recordValue: PublicTagRecord | null, repository = new FakeRepository(), rate = () => true, notifier = new FakeNotifier()) {
  return { repository, notifier, instance: new ContactRequestService(repository, { findByPublicCode: async () => recordValue }, rate, (value) => `hash:${value}`, notifier, () => new Date("2026-01-01T00:00:00Z")) };
}

const input = { publicCode: "public-code", finderName: " Finder ", finderEmail: " finder@example.test ", message: " Please help ", consent: "accepted" as const };

describe("ContactRequestService", () => {
  it("requires explicit email and consent, rejects HTML, and trims private input", () => {
    expect(createContactRequestSchema.parse(input)).toEqual({ publicCode: "public-code", finderName: "Finder", finderEmail: "finder@example.test", message: "Please help", consent: "accepted" });
    expect(() => createContactRequestSchema.parse({ ...input, finderEmail: "not-an-email" })).toThrow();
    expect(() => createContactRequestSchema.parse({ ...input, consent: undefined })).toThrow();
    expect(() => createContactRequestSchema.parse({ ...input, message: "<b>bad</b>" })).toThrow();
    expect(() => createContactRequestSchema.parse({ ...input, accountId: "x" })).toThrow();
  });

  it("persists only after matching Lost report, tag and public profile validation", async () => {
    const { repository, notifier, instance } = service(tag);
    await expect(instance.create(createContactRequestSchema.parse(input), "fingerprint")).resolves.toEqual({ accepted: true });
    expect(repository.created).toHaveLength(1);
    expect(repository.created[0]).toMatchObject({ lostReportId: tag.lostReport!.id, petId: tag.pet!.id, tagId: tag.tagId, finderName: "Finder", finderContact: "finder@example.test", message: "Please help", actorHash: "hash:fingerprint", finderConsentAcceptedAt: new Date("2026-01-01T00:00:00Z") });
    expect(notifier.queued).toEqual(new Set([record.id]));
    expect(JSON.stringify(repository.audits)).not.toMatch(/Finder|example|Please help|fingerprint/);
  });

  it("reuses the existing request idempotently and relies on the outbox as a second delivery guard", async () => {
    const { repository, notifier, instance } = service(tag);
    await instance.create(createContactRequestSchema.parse(input), "fingerprint");
    repository.reuseExisting = true;
    await expect(instance.create(createContactRequestSchema.parse(input), "fingerprint")).resolves.toEqual({ accepted: true });
    expect(repository.created).toHaveLength(1);
    expect(notifier.queued).toEqual(new Set([record.id]));
    expect(repository.audits).toContainEqual({ action: "contact.request.duplicate", tagId: tag.tagId, lostReportId: tag.lostReport!.id, result: "denied", reason: "idempotent_reuse" });
  });

  it.each([null, { ...tag, status: "active" }, { ...tag, lostReport: null }, { ...tag, pet: { ...tag.pet!, publicProfileEnabled: false } }, { ...tag, lostReport: { ...tag.lostReport!, petId: "other" } }])("fails closed without leaking private state", async (recordValue) => {
    const { repository, instance } = service(recordValue);
    await expect(instance.create(createContactRequestSchema.parse(input), "fp")).rejects.toMatchObject({ code: "UNAVAILABLE" });
    expect(repository.created).toHaveLength(0);
    expect(repository.audits[0]).toMatchObject({ action: "contact.request.denied", result: "denied" });
    expect(JSON.stringify(repository.audits)).not.toMatch(/Finder|example|Please help/);
  });

  it("uses a dedicated rate-limit policy", () => {
    clearRateLimitStateForTests();
    expect([1, 2, 3].map(() => allowFinderContact("finder"))).toEqual([true, true, true]);
    expect(allowFinderContact("finder")).toBe(false);
  });

  it("does not persist a partial request when repository creation fails", async () => {
    const repository = new FakeRepository();
    repository.fail = true;
    const { instance } = service(tag, repository);
    await expect(instance.create(createContactRequestSchema.parse(input), "fp")).rejects.toThrow("transaction rolled back");
    expect(repository.created).toHaveLength(0);
  });

  it("keeps the contact request when notification enqueue fails", async () => {
    const repository = new FakeRepository();
    const failingNotifier = { enqueueForContactRequest: async () => { throw new Error("notification unavailable"); } };
    const { instance } = service(tag, repository, () => true, failingNotifier);
    await expect(instance.create(createContactRequestSchema.parse(input), "fp")).resolves.toEqual({ accepted: true });
    expect(repository.created).toHaveLength(1);
  });

  it("audits honeypot attempts without receiving finder content", async () => {
    const repository = new FakeRepository();
    await service(tag, repository).instance.recordInvalidAttempt();
    expect(repository.audits).toEqual([{ action: "contact.request.invalid", tagId: null, lostReportId: null, result: "denied", reason: "honeypot" }]);
  });
});
