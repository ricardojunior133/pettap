import "server-only";

import { and, desc, eq, inArray, isNull } from "drizzle-orm";

import { auditLogs, nfcTags, pets } from "@/db/schema";
import { createDatabaseClient } from "@/lib/backend/db";

export type CustomerPetTagLinkRecord = { publicCode: string; linkedAt: Date };
export type CustomerPetTagLinkWriteResult = "linked" | "pet_not_found" | "pet_already_linked" | "tag_unavailable";

export interface CustomerPetTagLinkRepository {
  findLinkedTag(accountId: string, petPublicIdentifier: string): Promise<CustomerPetTagLinkRecord | null>;
  linkOwnedEligibleTag(accountId: string, petPublicIdentifier: string, publicCode: string): Promise<CustomerPetTagLinkWriteResult>;
}

/**
 * Linking is owner-scoped and changes only nfc_tags.pet_id. It never changes a
 * tag status, creates an activation, writes a credential, or provisions NFC.
 */
export class DrizzleCustomerPetTagLinkRepository implements CustomerPetTagLinkRepository {
  async findLinkedTag(accountId: string, petPublicIdentifier: string): Promise<CustomerPetTagLinkRecord | null> {
    const database = createDatabaseClient();
    const [tag] = await database.select({ publicCode: nfcTags.publicId, linkedAt: nfcTags.updatedAt })
      .from(pets)
      .innerJoin(nfcTags, and(eq(nfcTags.petId, pets.id), eq(nfcTags.accountId, accountId)))
      .where(and(eq(pets.accountId, accountId), eq(pets.publicId, petPublicIdentifier)))
      .orderBy(desc(nfcTags.updatedAt))
      .limit(1);
    return tag ?? null;
  }

  async linkOwnedEligibleTag(accountId: string, petPublicIdentifier: string, publicCode: string): Promise<CustomerPetTagLinkWriteResult> {
    const database = createDatabaseClient();
    return database.transaction(async (transaction) => {
      const [pet] = await transaction.select({ id: pets.id }).from(pets)
        .where(and(eq(pets.accountId, accountId), eq(pets.publicId, petPublicIdentifier)))
        .limit(1);
      if (!pet) return "pet_not_found";

      const [existing] = await transaction.select({ id: nfcTags.id }).from(nfcTags)
        .where(and(eq(nfcTags.accountId, accountId), eq(nfcTags.petId, pet.id)))
        .limit(1);
      if (existing) return "pet_already_linked";

      const [linked] = await transaction.update(nfcTags).set({ petId: pet.id, updatedAt: new Date() })
        .where(and(
          eq(nfcTags.accountId, accountId),
          eq(nfcTags.publicId, publicCode),
          isNull(nfcTags.petId),
          inArray(nfcTags.status, ["unassigned", "active"]),
        ))
        .returning({ id: nfcTags.id });
      if (!linked) return "tag_unavailable";

      await transaction.insert(auditLogs).values({
        accountId,
        action: "tag.linked",
        targetType: "nfc_tag",
        targetId: linked.id,
        result: "success",
        metadata: { petId: pet.id },
      });
      return "linked";
    });
  }
}
