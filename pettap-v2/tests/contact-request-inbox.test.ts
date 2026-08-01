import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { canTransitionContactRequest } from "@/features/contact-requests/contact-request-lifecycle";
import {
  ContactRequestInboxService,
  toContactRequestPublicIdentifier,
  toOwnerContactRequestDto,
} from "@/features/contact-requests/services/contact-request-inbox-service";
import type {
  ContactRequestLifecycleAudit,
  ContactRequestTransition,
  OwnerContactRequestPage,
  OwnerContactRequestRecord,
  OwnerContactRequestRepository,
} from "@/features/contact-requests/repositories/contact-request-repository";

const accountA = "11111111-1111-4111-8111-111111111111";
const record: OwnerContactRequestRecord = {
  id: "55555555-5555-4555-8555-555555555555", lostReportId: "44444444-4444-4444-8444-444444444444", petId: "22222222-2222-4222-8222-222222222222", tagId: "33333333-3333-4333-8333-333333333333",
  status: "pending", finderName: "Finder", finderContact: "finder@example.test", message: "Please help", petDisplayName: "Charlie", createdAt: new Date("2026-01-01T10:00:00Z"), processedAt: null, resolvedAt: null,
};

class FakeInboxRepository implements OwnerContactRequestRepository {
  accounts: string[] = []; audits: ContactRequestLifecycleAudit[] = []; transition: ContactRequestTransition = { outcome: "updated", previousStatus: "pending", record };
  async listForOwner(accountId: string, pagination: { page: number; pageSize: number }): Promise<OwnerContactRequestPage> { this.accounts.push(accountId); return { rows: [record], page: pagination.page, pageSize: pagination.pageSize, total: 1 }; }
  async countPendingForOwner(accountId: string) { this.accounts.push(accountId); return 1; }
  async getInboxSummary(accountId: string) { this.accounts.push(accountId); return { pendingCount: 1 }; }
  async findOwnedById(_accountId: string, id: string) { return id === record.id ? record : null; }
  async transitionOwned(accountId: string) { this.accounts.push(accountId); return this.transition; }
  async recordLifecycleAudit(event: ContactRequestLifecycleAudit) { this.audits.push(event); }
}

describe("tutor contact request inbox", () => {
  it("uses one central lifecycle contract", () => {
    expect(canTransitionContactRequest("pending", "delivered")).toBe(true);
    expect(canTransitionContactRequest("delivered", "closed")).toBe(true);
    expect(canTransitionContactRequest("closed", "closed")).toBe(true);
    expect(canTransitionContactRequest("closed", "delivered")).toBe(false);
    expect(canTransitionContactRequest("expired", "pending")).toBe(false);
    expect(canTransitionContactRequest("cancelled", "delivered")).toBe(false);
  });

  it("lists only the server-resolved owner account and returns an allowlisted DTO", async () => {
    const repository = new FakeInboxRepository();
    const service = new ContactRequestInboxService(repository, async () => ({ id: accountA }) as never);
    const inbox = await service.list({ page: 1 });
    expect(repository.accounts).toEqual([accountA, accountA]);
    expect(inbox.items[0].request).toEqual({ publicIdentifier: toContactRequestPublicIdentifier(record.id), status: "pending", finderName: "Finder", finderContact: "finder@example.test", message: "Please help", petDisplayName: "Charlie", createdAt: "2026-01-01T10:00:00.000Z", processedAt: undefined, resolvedAt: undefined });
    expect(JSON.stringify(inbox.items[0].request)).not.toMatch(/55555555|actorHash|lostReportId|tagId|petId|accountId/i);
  });

  it("rejects an anonymous inbox read before querying the repository", async () => {
    const repository = new FakeInboxRepository();
    const service = new ContactRequestInboxService(repository, async () => null);
    await expect(service.list()).rejects.toThrow("Authentication is required");
    expect(repository.accounts).toHaveLength(0);
  });

  it("transitions only through the owner-scoped repository and audits safe metadata", async () => {
    const repository = new FakeInboxRepository();
    const service = new ContactRequestInboxService(repository, async () => ({ id: accountA }) as never);
    await expect(service.markDelivered(record.id)).resolves.toEqual({ outcome: "updated" });
    expect(repository.accounts).toEqual([accountA]);
    expect(repository.audits).toEqual([{ action: "contact.request.delivered", contactRequestId: record.id, petId: record.petId, accountId: accountA, previousStatus: "pending", nextStatus: "delivered", result: "success" }]);
    expect(JSON.stringify(repository.audits)).not.toMatch(/Finder|example|Please help/);
  });

  it("rejects another account or invalid lifecycle without disclosing the request", async () => {
    const repository = new FakeInboxRepository();
    repository.transition = { outcome: "not_found", previousStatus: null, record: null };
    const service = new ContactRequestInboxService(repository, async () => ({ id: accountA }) as never);
    await expect(service.close("other-request")).rejects.toThrow("Request is unavailable");
    repository.transition = { outcome: "invalid_transition", previousStatus: "closed", record: { ...record, status: "closed" } };
    await expect(service.markDelivered(record.id)).rejects.toThrow("Request cannot be updated");
  });

  it("keeps internal identifiers in the Server Component action boundary, never the client DTO", () => {
    const card = readFileSync("features/contact-requests/components/owner-contact-request-card.tsx", "utf8");
    const page = readFileSync("app/account/contact-requests/page.tsx", "utf8");
    const actions = readFileSync("features/contact-requests/actions/contact-request-inbox-actions.ts", "utf8");
    expect(card).not.toMatch(/requestId|lostReportId|tagId|petId|actorHash|accountId/);
    expect(page).toContain(".bind(null, privateId)");
    expect(actions).toContain("isSameOriginRequest");
    expect(actions).toContain("requestIdSchema.parse");
    expect(actions).toContain("revalidatePath(\"/account/contact-requests\")");
  });

  it("has a stable opaque presentation identifier", () => {
    const dto = toOwnerContactRequestDto(record);
    expect(dto.publicIdentifier).toMatch(/^cr_[A-Za-z0-9_-]{22}$/);
    expect(dto.publicIdentifier).not.toContain(record.id);
  });
});
