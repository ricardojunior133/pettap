import "server-only";

import { eq } from "drizzle-orm";

import { auditLogs, profiles, settings, type AccountSettingsPayload } from "@/db/schema";
import { createDatabaseClient } from "@/lib/backend/db";

import type { CustomerProfileInput } from "../schemas/customer-profile";

export type CustomerProfileRecord = {
  accountId: string;
  displayName: string;
  phone: string | null;
  preferredLanguage: "en-GB";
};

export type CustomerProfileUpdateAudit = {
  changedFields: string[];
  languageChanged: boolean;
  preferencesChanged: boolean;
};

type SettingsRow = { payload: AccountSettingsPayload };

const profileSelection = {
  accountId: profiles.accountId,
  displayName: profiles.displayName,
  phone: profiles.phone,
};

function preferredLanguageFrom(payload: AccountSettingsPayload | null): "en-GB" {
  return payload?.preferredLanguage === "en-GB" ? payload.preferredLanguage : "en-GB";
}

function toRecord(
  profile: { accountId: string; displayName: string; phone: string | null },
  settingsRow?: SettingsRow,
): CustomerProfileRecord {
  return {
    ...profile,
    preferredLanguage: preferredLanguageFrom(settingsRow?.payload ?? null),
  };
}

export interface CustomerProfileRepository {
  getByAccountId(accountId: string): Promise<CustomerProfileRecord | null>;
  updateByAccountId(
    accountId: string,
    input: CustomerProfileInput,
    audit: CustomerProfileUpdateAudit,
  ): Promise<CustomerProfileRecord | null>;
}

export class DrizzleCustomerProfileRepository implements CustomerProfileRepository {
  async getByAccountId(accountId: string): Promise<CustomerProfileRecord | null> {
    const database = createDatabaseClient();
    const [profile] = await database
      .select(profileSelection)
      .from(profiles)
      .where(eq(profiles.accountId, accountId))
      .limit(1);

    if (!profile) return null;

    const [settingsRow] = await database
      .select({ payload: settings.payload })
      .from(settings)
      .where(eq(settings.accountId, accountId))
      .limit(1);

    return toRecord(profile, settingsRow);
  }

  async updateByAccountId(
    accountId: string,
    input: CustomerProfileInput,
    audit: CustomerProfileUpdateAudit,
  ): Promise<CustomerProfileRecord | null> {
    const database = createDatabaseClient();

    return database.transaction(async (transaction) => {
      const [currentSettings] = await transaction
        .select({ payload: settings.payload })
        .from(settings)
        .where(eq(settings.accountId, accountId))
        .limit(1);

      const [profile] = await transaction
        .update(profiles)
        .set({ displayName: input.displayName, phone: input.phone, updatedAt: new Date() })
        .where(eq(profiles.accountId, accountId))
        .returning(profileSelection);

      if (!profile) return null;

      const payload: AccountSettingsPayload = {
        ...(currentSettings?.payload ?? {}),
        preferredLanguage: input.preferredLanguage,
      };

      await transaction
        .insert(settings)
        .values({ accountId, payload })
        .onConflictDoUpdate({
          target: settings.accountId,
          set: { payload, updatedAt: new Date() },
        });

      if (audit.changedFields.length > 0) {
        await transaction.insert(auditLogs).values({
          accountId,
          action: "profile.updated",
          targetType: "profile",
          targetId: accountId,
          result: "success",
          metadata: audit,
        });
      }

      return toRecord(profile, { payload });
    });
  }
}
