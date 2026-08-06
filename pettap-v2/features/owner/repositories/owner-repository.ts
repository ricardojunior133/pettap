import "server-only";

import { and, eq } from "drizzle-orm";

import { createDatabaseClient } from "@/lib/backend/db";
import { accounts, profiles } from "@/db/schema";

export type AccountProfile = {
  accountId: string;
  displayName: string;
  phone: string | null;
};

export type EnsureAccountProfileRecordInput = {
  authUserId: string;
  displayName: string;
};

export interface OwnerRepository {
  ensureAccountProfile(input: EnsureAccountProfileRecordInput): Promise<AccountProfile>;
  findProfileByAccountId(accountId: string): Promise<AccountProfile | null>;
}

export class DrizzleOwnerRepository implements OwnerRepository {
  async ensureAccountProfile({ authUserId, displayName }: EnsureAccountProfileRecordInput) {
    const database = createDatabaseClient();

    return database.transaction(async (transaction) => {
      await transaction
        .insert(accounts)
        .values({ id: authUserId })
        .onConflictDoNothing({ target: accounts.id });

      const [existingProfile] = await transaction
        .select({
          accountId: profiles.accountId,
          displayName: profiles.displayName,
          phone: profiles.phone,
        })
        .from(profiles)
        .where(eq(profiles.accountId, authUserId))
        .limit(1);

      if (existingProfile) return existingProfile;

      // The profile shares the Auth UUID. This makes duplicate bootstraps safe
      // even though account_id was intentionally not made unique in Sprint 030.
      await transaction
        .insert(profiles)
        .values({
          id: authUserId,
          accountId: authUserId,
          displayName,
        })
        .onConflictDoNothing({ target: profiles.id });

      const [createdProfile] = await transaction
        .select({
          accountId: profiles.accountId,
          displayName: profiles.displayName,
          phone: profiles.phone,
        })
        .from(profiles)
        .where(and(eq(profiles.accountId, authUserId), eq(profiles.id, authUserId)))
        .limit(1);

      if (!createdProfile) {
        throw new Error("Account profile could not be initialized.");
      }

      return createdProfile;
    });
  }

  async findProfileByAccountId(accountId: string): Promise<AccountProfile | null> {
    const database = createDatabaseClient();
    const [profile] = await database
      .select({
        accountId: profiles.accountId,
        displayName: profiles.displayName,
        phone: profiles.phone,
      })
      .from(profiles)
      .where(eq(profiles.accountId, accountId))
      .limit(1);

    return profile ?? null;
  }
}
