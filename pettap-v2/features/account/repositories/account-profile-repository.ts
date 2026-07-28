import "server-only";

import { eq } from "drizzle-orm";

import { auditLogs, profiles } from "@/db/schema";
import { createDatabaseClient } from "@/lib/backend/db";

export type AccountProfileRecord = {
  displayName: string;
  phone: string | null;
};

export interface AccountProfileRepository {
  findByAccountId(accountId: string): Promise<AccountProfileRecord | null>;
  updateByAccountId(accountId: string, input: AccountProfileRecord): Promise<AccountProfileRecord | null>;
}

export class DrizzleAccountProfileRepository implements AccountProfileRepository {
  async findByAccountId(accountId: string): Promise<AccountProfileRecord | null> {
    const database = createDatabaseClient();
    const [profile] = await database
      .select({ displayName: profiles.displayName, phone: profiles.phone })
      .from(profiles)
      .where(eq(profiles.accountId, accountId))
      .limit(1);

    return profile ?? null;
  }

  async updateByAccountId(accountId: string, input: AccountProfileRecord): Promise<AccountProfileRecord | null> {
    const database = createDatabaseClient();
    return database.transaction(async (transaction) => {
      const [profile] = await transaction
        .update(profiles)
        .set({ displayName: input.displayName, phone: input.phone, updatedAt: new Date() })
        .where(eq(profiles.accountId, accountId))
        .returning({ displayName: profiles.displayName, phone: profiles.phone });
      if (!profile) return null;

      await transaction.insert(auditLogs).values({
        accountId,
        action: "profile.updated",
        targetType: "profile",
        result: "success",
        metadata: { fields: ["displayName", "phone"] },
      });
      return profile;
    });
  }
}
