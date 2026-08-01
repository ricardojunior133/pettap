import "server-only";

import { and, eq, inArray, lt, sql } from "drizzle-orm";
import { auditLogs, nfcTagCredentials, nfcTagProvisioningSessions, nfcTags } from "@/db/schema";
import { createDatabaseClient } from "@/lib/backend/db";

export type ProvisioningSession = { id: string; tagId: string; publicCode: string; initiatedByAccountId: string; status: "pending" | "issued" | "write_confirmed" | "activated" | "expired" | "cancelled" | "failed"; challengeHash: string; expiresAt: Date; credentialId: string };
export type CreateProvisioningSessionInput = { publicCode: string; actorAccountId: string; challengeHash: string; expiresAt: Date };

export interface NfcProvisioningRepository {
  start(input: CreateProvisioningSessionInput): Promise<ProvisioningSession | null>;
  get(sessionId: string): Promise<ProvisioningSession | null>;
  issue(sessionId: string, actorAccountId: string): Promise<ProvisioningSession | null>;
  confirmWrite(sessionId: string, actorAccountId: string): Promise<ProvisioningSession | null>;
  cancel(sessionId: string, actorAccountId: string): Promise<ProvisioningSession | null>;
  markActivated(sessionId: string): Promise<void>;
  expire(now: Date): Promise<number>;
}

function map(row: typeof nfcTagProvisioningSessions.$inferSelect & { publicCode: string }): ProvisioningSession {
  return { id: row.id, tagId: row.tagId, publicCode: row.publicCode, initiatedByAccountId: row.initiatedByAccountId, status: row.status, challengeHash: row.challengeHash, expiresAt: row.expiresAt, credentialId: row.credentialId };
}

/** Private server repository. Every mutating action is serialised per public code. */
export class DrizzleNfcProvisioningRepository implements NfcProvisioningRepository {
  async start(input: CreateProvisioningSessionInput) {
    const database = createDatabaseClient();
    return database.transaction(async (tx) => {
      await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${input.publicCode}))`);
      const [tag] = await tx.select().from(nfcTags).where(eq(nfcTags.publicId, input.publicCode)).limit(1);
      if (!tag || tag.status !== "unassigned") return null;
      await tx.update(nfcTagProvisioningSessions).set({ status: "expired", updatedAt: new Date() })
        .where(and(eq(nfcTagProvisioningSessions.tagId, tag.id), inArray(nfcTagProvisioningSessions.status, ["pending", "issued", "write_confirmed"]), lt(nfcTagProvisioningSessions.expiresAt, new Date())));
      const [credential] = await tx.select({ id: nfcTagCredentials.id }).from(nfcTagCredentials)
        .where(and(eq(nfcTagCredentials.tagId, tag.id), eq(nfcTagCredentials.status, "active"))).limit(1);
      if (!credential) return null;
      const [session] = await tx.insert(nfcTagProvisioningSessions).values({ tagId: tag.id, credentialId: credential.id, initiatedByAccountId: input.actorAccountId, challengeHash: input.challengeHash, expiresAt: input.expiresAt }).returning();
      await tx.insert(auditLogs).values({ accountId: input.actorAccountId, action: "nfc.provisioning_started", targetType: "nfc_tag", targetId: tag.id, metadata: { sessionId: session.id, status: session.status } });
      return map({ ...session, publicCode: tag.publicId });
    });
  }
  async get(sessionId: string) {
    const database = createDatabaseClient();
    const [row] = await database.select({ session: nfcTagProvisioningSessions, publicCode: nfcTags.publicId }).from(nfcTagProvisioningSessions).innerJoin(nfcTags, eq(nfcTagProvisioningSessions.tagId, nfcTags.id)).where(eq(nfcTagProvisioningSessions.id, sessionId)).limit(1);
    return row ? map({ ...row.session, publicCode: row.publicCode }) : null;
  }
  async issue(sessionId: string, actorAccountId: string) { return this.transition(sessionId, actorAccountId, ["pending"], "issued", "issuedAt", "nfc.payload_issued"); }
  async confirmWrite(sessionId: string, actorAccountId: string) { return this.transition(sessionId, actorAccountId, ["issued"], "write_confirmed", "writeConfirmedAt", "nfc.write_confirmed"); }
  async cancel(sessionId: string, actorAccountId: string) { return this.transition(sessionId, actorAccountId, ["pending", "issued", "write_confirmed"], "cancelled", "cancelledAt", "nfc.provisioning_cancelled"); }
  async markActivated(sessionId: string) { const database = createDatabaseClient(); await database.update(nfcTagProvisioningSessions).set({ status: "activated", activatedAt: new Date(), updatedAt: new Date() }).where(and(eq(nfcTagProvisioningSessions.id, sessionId), eq(nfcTagProvisioningSessions.status, "write_confirmed"))); }
  async expire(now: Date) { const database = createDatabaseClient(); const rows = await database.update(nfcTagProvisioningSessions).set({ status: "expired", updatedAt: now }).where(and(inArray(nfcTagProvisioningSessions.status, ["pending", "issued", "write_confirmed"]), lt(nfcTagProvisioningSessions.expiresAt, now))).returning({ id: nfcTagProvisioningSessions.id }); return rows.length; }
  private async transition(sessionId: string, actorAccountId: string, allowed: ProvisioningSession["status"][], target: ProvisioningSession["status"], timestampColumn: "issuedAt" | "writeConfirmedAt" | "cancelledAt", action: string) {
    const session = await this.get(sessionId);
    if (!session || session.initiatedByAccountId !== actorAccountId || !allowed.includes(session.status) || session.expiresAt <= new Date()) return null;
    const database = createDatabaseClient();
    const [updated] = await database.update(nfcTagProvisioningSessions).set({ status: target, [timestampColumn]: new Date(), updatedAt: new Date() }).where(and(eq(nfcTagProvisioningSessions.id, sessionId), inArray(nfcTagProvisioningSessions.status, allowed))).returning();
    if (!updated) return null;
    await database.insert(auditLogs).values({ accountId: actorAccountId, action, targetType: "nfc_tag", targetId: updated.tagId, metadata: { sessionId } });
    return map({ ...updated, publicCode: session.publicCode });
  }
}
