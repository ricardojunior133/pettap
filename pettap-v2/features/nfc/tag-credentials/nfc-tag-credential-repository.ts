import "server-only";

import { and, eq, sql } from "drizzle-orm";

import { nfcTagCredentials, nfcTags } from "@/db/schema";
import { createDatabaseClient } from "@/lib/backend/db";

export type NfcTagCredentialStatus = "active" | "rotated" | "revoked";

export type NfcTagCredentialRecord = {
  id: string;
  tagId: string;
  credentialHash: string;
  credentialHint: string;
  status: NfcTagCredentialStatus;
  createdByAccountId: string | null;
  createdAt: Date;
  rotatedAt: Date | null;
  revokedAt: Date | null;
};

export type NewNfcTagCredential = Pick<NfcTagCredentialRecord, "tagId" | "credentialHash" | "credentialHint" | "createdByAccountId">;

export class NfcTagNotFoundError extends Error {}
export class ActiveNfcTagCredentialExistsError extends Error {}
export class ActiveNfcTagCredentialNotFoundError extends Error {}

export interface NfcTagCredentialRepository {
  issue(input: NewNfcTagCredential): Promise<NfcTagCredentialRecord>;
  rotate(input: NewNfcTagCredential): Promise<NfcTagCredentialRecord>;
  revoke(tagId: string): Promise<NfcTagCredentialRecord>;
  findActiveByTagId(tagId: string): Promise<NfcTagCredentialRecord | null>;
  findActiveByPublicCode(publicCode: string): Promise<NfcTagCredentialRecord | null>;
}

function toRecord(record: typeof nfcTagCredentials.$inferSelect): NfcTagCredentialRecord {
  return {
    ...record,
    status: record.status as NfcTagCredentialStatus,
  };
}

/**
 * The advisory transaction lock serializes lifecycle writes for one tag. The
 * partial unique index remains the database-level backstop against two active
 * credentials if another writer bypasses this repository.
 */
export class DrizzleNfcTagCredentialRepository implements NfcTagCredentialRepository {
  async issue(input: NewNfcTagCredential): Promise<NfcTagCredentialRecord> {
    return this.withTagLock(input.tagId, async (database) => {
      await this.requireTag(database, input.tagId);
      const active = await this.findActive(database, input.tagId);
      if (active) throw new ActiveNfcTagCredentialExistsError();
      return this.insertActive(database, input);
    });
  }

  async rotate(input: NewNfcTagCredential): Promise<NfcTagCredentialRecord> {
    return this.withTagLock(input.tagId, async (database) => {
      await this.requireTag(database, input.tagId);
      const active = await this.findActive(database, input.tagId);
      if (!active) throw new ActiveNfcTagCredentialNotFoundError();

      await database
        .update(nfcTagCredentials)
        .set({ status: "rotated", rotatedAt: new Date() })
        .where(and(eq(nfcTagCredentials.id, active.id), eq(nfcTagCredentials.status, "active")));

      return this.insertActive(database, input);
    });
  }

  async revoke(tagId: string): Promise<NfcTagCredentialRecord> {
    return this.withTagLock(tagId, async (database) => {
      const active = await this.findActive(database, tagId);
      if (!active) throw new ActiveNfcTagCredentialNotFoundError();

      const [revoked] = await database
        .update(nfcTagCredentials)
        .set({ status: "revoked", revokedAt: new Date() })
        .where(and(eq(nfcTagCredentials.id, active.id), eq(nfcTagCredentials.status, "active")))
        .returning();

      if (!revoked) throw new ActiveNfcTagCredentialNotFoundError();
      return toRecord(revoked);
    });
  }

  async findActiveByTagId(tagId: string): Promise<NfcTagCredentialRecord | null> {
    const database = createDatabaseClient();
    const credential = await this.findActive(database, tagId);
    return credential ? toRecord(credential) : null;
  }

  async findActiveByPublicCode(publicCode: string): Promise<NfcTagCredentialRecord | null> {
    const database = createDatabaseClient();
    const [credential] = await database
      .select({ credential: nfcTagCredentials })
      .from(nfcTagCredentials)
      .innerJoin(nfcTags, eq(nfcTagCredentials.tagId, nfcTags.id))
      .where(and(eq(nfcTags.publicId, publicCode), eq(nfcTagCredentials.status, "active")))
      .limit(1);
    return credential ? toRecord(credential.credential) : null;
  }

  private async withTagLock<T>(tagId: string, callback: (database: ReturnType<typeof createDatabaseClient>) => Promise<T>): Promise<T> {
    const database = createDatabaseClient();
    return database.transaction(async (transaction) => {
      await transaction.execute(sql`select pg_advisory_xact_lock(hashtext(${tagId}))`);
      return callback(transaction);
    });
  }

  private async requireTag(database: ReturnType<typeof createDatabaseClient>, tagId: string): Promise<void> {
    const [tag] = await database.select({ id: nfcTags.id }).from(nfcTags).where(eq(nfcTags.id, tagId)).limit(1);
    if (!tag) throw new NfcTagNotFoundError();
  }

  private async findActive(database: ReturnType<typeof createDatabaseClient>, tagId: string) {
    const [credential] = await database
      .select()
      .from(nfcTagCredentials)
      .where(and(eq(nfcTagCredentials.tagId, tagId), eq(nfcTagCredentials.status, "active")))
      .limit(1);
    return credential ?? null;
  }

  private async insertActive(database: ReturnType<typeof createDatabaseClient>, input: NewNfcTagCredential): Promise<NfcTagCredentialRecord> {
    const [credential] = await database.insert(nfcTagCredentials).values({
      ...input,
      status: "active",
    }).returning();
    return toRecord(credential);
  }
}
