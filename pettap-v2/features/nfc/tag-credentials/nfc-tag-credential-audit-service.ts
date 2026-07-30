import "server-only";

import { auditLogs } from "@/db/schema";
import { createDatabaseClient } from "@/lib/backend/db";

export type NfcTagCredentialAuditAction =
  | "nfc.credential_issued"
  | "nfc.credential_rotated"
  | "nfc.credential_revoked";

export interface NfcTagCredentialAuditService {
  record(input: {
    actorAccountId: string;
    action: NfcTagCredentialAuditAction;
    tagId: string;
    hint: string;
  }): Promise<void>;
}

/** Writes only support-safe metadata. Credential plaintext and hashes are excluded by design. */
export class DrizzleNfcTagCredentialAuditService implements NfcTagCredentialAuditService {
  async record(input: {
    actorAccountId: string;
    action: NfcTagCredentialAuditAction;
    tagId: string;
    hint: string;
  }): Promise<void> {
    const database = createDatabaseClient();
    await database.insert(auditLogs).values({
      accountId: input.actorAccountId,
      action: input.action,
      targetType: "nfc_tag_credential",
      targetId: input.tagId,
      metadata: { hint: input.hint },
    });
  }
}
