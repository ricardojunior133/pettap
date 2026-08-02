import "server-only";

import { getAuthenticatedAccountId, type AccountResolver } from "@/features/commerce/services/commerce-account-service";

import {
  DrizzleCustomerPetTagActivationRepository,
  type CustomerPetTagActivationRecord,
  type CustomerPetTagActivationRepository,
  type CustomerPetTagActivationWriteResult,
} from "../repositories/customer-pet-tag-activation-repository";

export type CustomerPetTagActivationView = {
  publicCode: string;
  status: "active";
  activatedAt: string;
  readyForPublicProfile: true;
};

export type CustomerPetTagActivationResult =
  | { ok: true; activation: CustomerPetTagActivationView; idempotent: boolean }
  | { ok: false; code: "AUTHENTICATION_REQUIRED" | "PET_NOT_FOUND" | "TAG_NOT_LINKED" | "TAG_NOT_ELIGIBLE" };

function toView(record: CustomerPetTagActivationRecord): CustomerPetTagActivationView | null {
  if (record.status !== "active" || !record.activatedAt) return null;
  return { publicCode: record.publicCode, status: "active", activatedAt: record.activatedAt.toISOString(), readyForPublicProfile: true };
}

function toResult(result: CustomerPetTagActivationWriteResult): CustomerPetTagActivationResult {
  if (result.kind === "activated") {
    const activation = toView(result.activation);
    return activation ? { ok: true, activation, idempotent: result.idempotent } : { ok: false, code: "TAG_NOT_ELIGIBLE" };
  }
  return { ok: false, code: result.kind === "pet_not_found" ? "PET_NOT_FOUND" : result.kind === "tag_not_linked" ? "TAG_NOT_LINKED" : "TAG_NOT_ELIGIBLE" };
}

export class CustomerPetTagActivationService {
  constructor(
    private readonly repository: CustomerPetTagActivationRepository = new DrizzleCustomerPetTagActivationRepository(),
    private readonly resolveAccountId: AccountResolver = getAuthenticatedAccountId,
  ) {}

  async getActivation(petPublicIdentifier: string): Promise<CustomerPetTagActivationView | null> {
    const accountId = await this.accountId();
    if (!accountId) return null;
    const tag = await this.repository.findOwnedLinkedTag(accountId, petPublicIdentifier);
    return tag ? toView(tag) : null;
  }

  async activate(petPublicIdentifier: string): Promise<CustomerPetTagActivationResult> {
    const accountId = await this.accountId();
    if (!accountId) return { ok: false, code: "AUTHENTICATION_REQUIRED" };
    return toResult(await this.repository.activateOwnedLinkedTag(accountId, petPublicIdentifier));
  }

  private async accountId(): Promise<string | null> {
    try {
      return await this.resolveAccountId();
    } catch {
      return null;
    }
  }
}
