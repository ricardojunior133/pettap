import "server-only";

import { getAuthenticatedAccountId } from "@/features/commerce/services/commerce-account-service";

import { DrizzleCustomerTagFoundationRepository, type CustomerTagFoundationRepository, type OwnedTagFoundationRecord } from "../repositories/customer-tag-foundation-repository";

export type CustomerTagFoundationStatus = "Ready to activate" | "Active" | "Suspended" | "Lost mode active" | "Retired" | "Unavailable";
export type CustomerTagFoundationDto = {
  publicIdentifier: string;
  status: CustomerTagFoundationStatus;
  activatedAt: string | null;
  petSummary: { publicIdentifier: string; name: string; archived: boolean } | null;
  canOpenPublicProfile: boolean;
  canBeAssigned: false;
};
export type CustomerTagFoundationPageDto = { tags: CustomerTagFoundationDto[]; page: number; pageSize: number; total: number; totalPages: number };

const pageSize = 12;
const statusLabels: Record<OwnedTagFoundationRecord["status"], CustomerTagFoundationStatus> = { unassigned: "Ready to activate", active: "Active", suspended: "Suspended", lost: "Lost mode active", retired: "Retired" };

export function toCustomerTagFoundationDto(record: OwnedTagFoundationRecord): CustomerTagFoundationDto {
  return {
    publicIdentifier: record.publicId,
    status: statusLabels[record.status] ?? "Unavailable",
    activatedAt: record.activatedAt?.toISOString() ?? null,
    petSummary: record.pet ? { publicIdentifier: record.pet.publicId, name: record.pet.name, archived: record.pet.archivedAt !== null } : null,
    canOpenPublicProfile: Boolean(record.pet && record.pet.publicProfileEnabled && (record.status === "active" || record.status === "lost")),
    // Association needs the canonical physical activation flow; no write is exposed in this foundation sprint.
    canBeAssigned: false,
  };
}

export class CustomerTagFoundationService {
  constructor(private readonly repository: CustomerTagFoundationRepository = new DrizzleCustomerTagFoundationRepository(), private readonly resolveAccountId: () => Promise<string> = getAuthenticatedAccountId) {}
  async listOwnedTags(page = 1): Promise<CustomerTagFoundationPageDto> {
    const safePage = Number.isInteger(page) && page > 0 ? page : 1;
    const result = await this.repository.listOwnedTags(await this.resolveAccountId(), { page: safePage, pageSize });
    return { tags: result.rows.map(toCustomerTagFoundationDto), page: safePage, pageSize, total: result.total, totalPages: Math.ceil(result.total / pageSize) };
  }
  async getOwnedTag(publicIdentifier: string) { const record = await this.repository.findOwnedTagByPublicId(await this.resolveAccountId(), publicIdentifier.trim()); return record ? toCustomerTagFoundationDto(record) : null; }
}
