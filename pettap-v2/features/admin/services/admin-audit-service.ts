import "server-only";

import { auditLogs } from "@/db/schema";
import { createDatabaseClient } from "@/lib/backend/db";

export type AdminAuditAction = "admin.access.denied";

export class AdminAuditService {
  async record(input: {
    actorAccountId: string | null;
    action: AdminAuditAction;
    targetType: "admin_area";
    targetId?: string | null;
    result?: "success" | "denied";
    metadata?: Record<string, string>;
  }): Promise<void> {
    const database = createDatabaseClient();
    await database.insert(auditLogs).values({
      accountId: input.actorAccountId,
      action: input.action,
      targetType: input.targetType,
      targetId: input.targetId ?? null,
      result: input.result ?? "success",
      metadata: input.metadata ?? null,
    });
  }
}
