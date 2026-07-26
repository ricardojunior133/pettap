import "server-only";

import { auditLogs } from "@/db/schema";
import { createDatabaseClient } from "@/lib/backend/db";

import type { EventDemoAuditEvent } from "../constants/audit-events";

export class EventDemoAuditService {
  async record(input: {
    action: EventDemoAuditEvent;
    targetType: "event_demo_tag" | "event_demo_session" | "lead";
    targetId: string | null;
    result?: "success" | "failed";
    metadata: Record<string, string | null>;
    actorAccountId?: string | null;
  }): Promise<void> {
    const database = createDatabaseClient();
    await database.insert(auditLogs).values({ accountId: input.actorAccountId ?? null, action: input.action, targetType: input.targetType, targetId: input.targetId, result: input.result ?? "success", metadata: input.metadata });
  }
}
