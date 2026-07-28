import "server-only";

import { and, desc, eq } from "drizzle-orm";

import { nfcTags, tagActivations } from "@/db/schema";
import { createDatabaseClient } from "@/lib/backend/db";

export interface CustomerTagActivationFoundationRepository {
  findLatestActivationForOwnedTag(accountId: string, publicId: string): Promise<Date | null>;
}

/** Read-only activation lookup, scoped through the tag owned by the account. */
export class DrizzleCustomerTagActivationFoundationRepository implements CustomerTagActivationFoundationRepository {
  async findLatestActivationForOwnedTag(accountId: string, publicId: string) {
    const database = createDatabaseClient();
    const [activation] = await database.select({ createdAt: tagActivations.createdAt })
      .from(tagActivations)
      .innerJoin(nfcTags, eq(tagActivations.tagId, nfcTags.id))
      .where(and(
        eq(nfcTags.accountId, accountId),
        eq(nfcTags.publicId, publicId),
        eq(tagActivations.accountId, accountId),
      ))
      .orderBy(desc(tagActivations.createdAt))
      .limit(1);
    return activation?.createdAt ?? null;
  }
}
