import "server-only";

import { eq } from "drizzle-orm";

import { profiles } from "@/db/schema";
import { createDatabaseClient } from "@/lib/backend/db";

export type AccountProfileRecord = {
  displayName: string;
  phone: string | null;
};

export interface AccountProfileRepository {
  findByAccountId(accountId: string): Promise<AccountProfileRecord | null>;
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
}
