import "server-only";

import { getAuthenticatedAccountId } from "@/features/commerce/services/commerce-account-service";

import type { CustomerPetTagLinkInput } from "../schemas/customer-pet-tag-link";
import {
  DrizzleCustomerPetTagLinkRepository,
  type CustomerPetTagLinkRecord,
  type CustomerPetTagLinkRepository,
} from "../repositories/customer-pet-tag-link-repository";

export type CustomerPetTagLinkView = { publicCode: string; linkedAt: string };
export type CustomerPetTagLinkResult =
  | { ok: true; link: CustomerPetTagLinkView }
  | { ok: false; code: "PET_NOT_FOUND" | "PET_ALREADY_LINKED" | "TAG_UNAVAILABLE" };

function toView(record: CustomerPetTagLinkRecord): CustomerPetTagLinkView {
  return { publicCode: record.publicCode, linkedAt: record.linkedAt.toISOString() };
}

export class CustomerPetTagLinkService {
  constructor(
    private readonly repository: CustomerPetTagLinkRepository = new DrizzleCustomerPetTagLinkRepository(),
    private readonly resolveAccountId: () => Promise<string> = getAuthenticatedAccountId,
  ) {}

  async getLink(petPublicIdentifier: string): Promise<CustomerPetTagLinkView | null> {
    const link = await this.repository.findLinkedTag(await this.resolveAccountId(), petPublicIdentifier);
    return link ? toView(link) : null;
  }

  async link(petPublicIdentifier: string, input: CustomerPetTagLinkInput): Promise<CustomerPetTagLinkResult> {
    const accountId = await this.resolveAccountId();
    const outcome = await this.repository.linkOwnedEligibleTag(accountId, petPublicIdentifier, input.publicCode);
    if (outcome === "pet_not_found") return { ok: false, code: "PET_NOT_FOUND" };
    if (outcome === "pet_already_linked") return { ok: false, code: "PET_ALREADY_LINKED" };
    if (outcome === "tag_unavailable") return { ok: false, code: "TAG_UNAVAILABLE" };

    const link = await this.repository.findLinkedTag(accountId, petPublicIdentifier);
    return link ? { ok: true, link: toView(link) } : { ok: false, code: "TAG_UNAVAILABLE" };
  }
}
