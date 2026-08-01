import "server-only";

import { createHash } from "node:crypto";

import { getCurrentUser } from "@/lib/backend/auth/get-current-user";
import {
  DrizzleContactRequestRepository,
  type OwnerContactRequestRecord,
  type OwnerContactRequestRepository,
} from "../repositories/contact-request-repository";

export type OwnerContactRequestDto = {
  publicIdentifier: string;
  status: "pending" | "delivered" | "closed" | "expired" | "cancelled";
  finderName?: string;
  finderContact?: string;
  message?: string;
  petDisplayName?: string;
  createdAt: string;
  processedAt?: string;
  resolvedAt?: string;
};

export type OwnerContactRequestInboxItem = { privateId: string; request: OwnerContactRequestDto };
export type ContactRequestInboxPage = {
  items: OwnerContactRequestInboxItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  pendingCount: number;
};

export class ContactRequestInboxAuthorizationError extends Error {}
export class ContactRequestInboxMutationError extends Error {}

const pageSize = 12;

/**
 * This is opaque presentation data, not a database identifier. Actions receive
 * their protected, server-bound identifier separately and re-check ownership.
 */
export function toContactRequestPublicIdentifier(id: string) {
  return `cr_${createHash("sha256").update(`pettap-contact-request:v1:${id}`).digest("base64url").slice(0, 22)}`;
}

function asOptionalIso(value: Date | null) {
  return value ? value.toISOString() : undefined;
}

export function toOwnerContactRequestDto(record: OwnerContactRequestRecord): OwnerContactRequestDto {
  return {
    publicIdentifier: toContactRequestPublicIdentifier(record.id),
    status: record.status,
    finderName: record.finderName || undefined,
    finderContact: record.finderContact || undefined,
    message: record.message || undefined,
    petDisplayName: record.petDisplayName || undefined,
    createdAt: record.createdAt.toISOString(),
    processedAt: asOptionalIso(record.processedAt),
    resolvedAt: asOptionalIso(record.resolvedAt),
  };
}

export class ContactRequestInboxService {
  constructor(
    private readonly repository: OwnerContactRequestRepository = new DrizzleContactRequestRepository(),
    private readonly resolveUser = getCurrentUser,
  ) {}

  private async accountId() {
    const user = await this.resolveUser();
    if (!user) throw new ContactRequestInboxAuthorizationError("Authentication is required.");
    return user.id;
  }

  async list({ page = 1 }: { page?: number } = {}): Promise<ContactRequestInboxPage> {
    const accountId = await this.accountId();
    const safePage = Number.isSafeInteger(page) && page > 0 ? page : 1;
    const result = await this.repository.listForOwner(accountId, { page: safePage, pageSize });
    const summary = await this.repository.getInboxSummary(accountId);
    await Promise.all(result.rows.map((record) => this.repository.recordLifecycleAudit({
      action: "contact.request.viewed", contactRequestId: record.id, petId: record.petId, accountId,
      previousStatus: record.status, nextStatus: null, result: "success",
    }).catch(() => undefined)));
    return {
      items: result.rows.map((record) => ({ privateId: record.id, request: toOwnerContactRequestDto(record) })),
      page: result.page,
      pageSize: result.pageSize,
      total: result.total,
      totalPages: Math.max(1, Math.ceil(result.total / result.pageSize)),
      pendingCount: summary.pendingCount,
    };
  }

  async markDelivered(id: string) { return this.transition(id, "delivered"); }
  async close(id: string) { return this.transition(id, "closed"); }
  async expire(id: string) { return this.transition(id, "expired"); }

  private async transition(id: string, nextStatus: "delivered" | "closed" | "expired") {
    const accountId = await this.accountId();
    const result = await this.repository.transitionOwned(accountId, id, nextStatus);
    if (result.outcome === "not_found") throw new ContactRequestInboxMutationError("Request is unavailable.");
    if (result.outcome === "invalid_transition") throw new ContactRequestInboxMutationError("Request cannot be updated.");
    if (result.record) {
      await this.repository.recordLifecycleAudit({
        action: `contact.request.${nextStatus}`,
        contactRequestId: result.record.id,
        petId: result.record.petId,
        accountId,
        previousStatus: result.previousStatus,
        nextStatus,
        result: "success",
      });
    }
    return { outcome: result.outcome };
  }
}
