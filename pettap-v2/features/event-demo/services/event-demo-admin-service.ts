import "server-only";

import { requireAdminPermission } from "@/lib/auth/require-admin";

import { EventDemoDomainError } from "../domain/errors";
import { EventDemoAdminRepository } from "../repositories/event-demo-admin-repository";
import { EventDemoSessionRepository } from "../repositories/event-demo-session-repository";
import { EventDemoTagRepository } from "../repositories/event-demo-tag-repository";
import { LeadRepository } from "../repositories/lead-repository";
import { createEventDemoTagBatchSchema, createEventDemoTagSchema, type CreateEventDemoTagBatchInput, type CreateEventDemoTagInput } from "../schemas/event-demo";
import { SupabaseEventDemoPhotoStorage } from "./event-demo-photo-storage";
import { EventDemoSessionService } from "./event-demo-session-service";
import { EventDemoTagService } from "./event-demo-tag-service";
import { EventDemoAuditService } from "./event-demo-audit-service";
import { normalisePaginationAfterCount } from "./event-demo-pagination";

export type EventDemoAdminTagView = { id: string; internalName: string; publicCode: string; status: string; isEnabled: boolean; sessionDurationMinutes: number; usageCount: number; lastUsedAt: string | null; lastResetAt: string | null; latestSession: null | { publicId: string; publicRef: string; status: string; startedAt: string; expiresAt: string; completedAt: string | null; hasPhoto: boolean; cleanupRequired: boolean; profileAvailable: boolean } };
export type EventDemoSessionAdminView = { id: string; publicRef: string; tagId: string; status: string; createdAt: string; expiresAt: string; completedAt: string | null; deletedAt: string | null; hasPhoto: boolean; marketingConsent: boolean; profileAvailable: boolean; cleanupRequired: boolean };
export type EventDemoLeadView = { firstName: string | null; email: string; source: string; consentVersion: string | null; consentedAt: string | null; createdAt: string; updatedAt: string };

const pageSize = 20;
const safeRef = (value: string) => `${value.slice(0, 10)}…`;
const periodStart = (period: "today" | "24h" | "7d" | "30d" | undefined) => {
  const now = new Date(); if (period === "today") return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (period === "24h") return new Date(now.getTime() - 86_400_000); if (period === "7d") return new Date(now.getTime() - 7 * 86_400_000); if (period === "30d") return new Date(now.getTime() - 30 * 86_400_000); return undefined;
};

export class EventDemoAdminService {
  constructor(
    private readonly tags = new EventDemoTagRepository(),
    private readonly sessions = new EventDemoSessionRepository(),
    private readonly leads = new LeadRepository(),
    private readonly admin = new EventDemoAdminRepository(),
    private readonly audit = new EventDemoAuditService(),
  ) {}

  async overview(input: { tagPage?: number; sessionPage?: number; leadPage?: number; tagStatus?: "available" | "in_progress" | "completed" | "expired" | "disabled"; tagEnabled?: boolean; attentionOnly?: boolean; sessionStatus?: "started" | "profile_created" | "completed" | "expired" | "deleted"; sessionTag?: string; sessionPeriod?: "today" | "24h" | "7d"; leadSource?: "event_demo" | "fair"; leadPeriod?: "today" | "7d" | "30d" } = {}) {
    const context = await requireAdminPermission("event_demo.view");
    const [metrics, tags, sessions, leads] = await Promise.all([
      this.admin.getMetrics(),
      this.tags.listPage({ page: Math.max(1, input.tagPage ?? 1), pageSize, status: input.tagStatus, enabled: input.tagEnabled, attentionOnly: input.attentionOnly }),
      this.sessions.listRecent({ page: Math.max(1, input.sessionPage ?? 1), pageSize, status: input.sessionStatus, tagId: input.sessionTag, since: periodStart(input.sessionPeriod) }),
      this.leads.listConsented({ page: Math.max(1, input.leadPage ?? 1), pageSize, source: input.leadSource, since: periodStart(input.leadPeriod) }),
    ]);
    const latest = await this.admin.latestSessionsByTagIds(tags.rows.map((tag) => tag.id));
    return {
      canManage: context.permissions.includes("event_demo.manage"), metrics,
      tags: { ...normalisePaginationAfterCount(input.tagPage, tags.total, pageSize), rows: tags.rows.map((tag): EventDemoAdminTagView => {
        const session = latest.get(tag.id);
        return { id: tag.id, internalName: tag.internalName, publicCode: tag.publicCode, status: tag.status, isEnabled: tag.isEnabled, sessionDurationMinutes: tag.sessionDurationMinutes, usageCount: tag.usageCount, lastUsedAt: tag.lastUsedAt?.toISOString() ?? null, lastResetAt: tag.lastResetAt?.toISOString() ?? null, latestSession: session ? { publicId: session.publicId, publicRef: safeRef(session.publicId), status: session.status, startedAt: session.createdAt.toISOString(), expiresAt: session.expiresAt.toISOString(), completedAt: session.completedAt?.toISOString() ?? null, hasPhoto: Boolean(session.photoStoragePath), cleanupRequired: !session.deletedAt && session.expiresAt <= new Date() && session.status !== "deleted", profileAvailable: session.status === "completed" && !session.deletedAt } : null };
      }) },
      sessions: { ...normalisePaginationAfterCount(input.sessionPage, sessions.total, pageSize), rows: sessions.rows.map((session): EventDemoSessionAdminView => ({ id: session.id, publicRef: safeRef(session.publicId), tagId: session.demoTagId, status: session.status, createdAt: session.createdAt.toISOString(), expiresAt: session.expiresAt.toISOString(), completedAt: session.completedAt?.toISOString() ?? null, deletedAt: session.deletedAt?.toISOString() ?? null, hasPhoto: Boolean(session.photoStoragePath), marketingConsent: session.marketingConsent, profileAvailable: session.status === "completed" && !session.deletedAt, cleanupRequired: !session.deletedAt && session.expiresAt <= new Date() && session.status !== "deleted" })) },
      leads: { ...normalisePaginationAfterCount(input.leadPage, leads.total, pageSize), rows: leads.rows.map((lead): EventDemoLeadView => ({ firstName: lead.firstName, email: lead.email, source: lead.source, consentVersion: lead.consentVersion, consentedAt: lead.consentedAt?.toISOString() ?? null, createdAt: lead.createdAt.toISOString(), updatedAt: lead.updatedAt.toISOString() })) },
    };
  }

  async searchConsentedLead(email: string) {
    await requireAdminPermission("event_demo.view");
    const lead = await this.leads.findConsentedByEmail(email);
    return lead ? { firstName: lead.firstName, email: lead.email, source: lead.source, consentVersion: lead.consentVersion, consentedAt: lead.consentedAt?.toISOString() ?? null } : null;
  }

  async createTag(input: CreateEventDemoTagInput) {
    const actor = await requireAdminPermission("event_demo.manage");
    const tag = await new EventDemoTagService(this.tags).create(createEventDemoTagSchema.parse(input));
    await this.audit.record({ actorAccountId: actor.accountId, action: "event_demo.tag_created", targetType: "event_demo_tag", targetId: tag.id, metadata: { tagId: tag.id, quantity: "1", status: tag.status } });
    return { id: tag.id, internalName: tag.internalName, publicCode: tag.publicCode, sessionDurationMinutes: tag.sessionDurationMinutes };
  }

  async createTagBatch(input: CreateEventDemoTagBatchInput) {
    const actor = await requireAdminPermission("event_demo.manage");
    const values = createEventDemoTagBatchSchema.parse(input);
    const created = [];
    for (let index = 1; index <= values.quantity; index += 1) created.push(await new EventDemoTagService(this.tags).create({ internalName: `${values.internalNamePrefix} ${String(index).padStart(2, "0")}`, sessionDurationMinutes: values.sessionDurationMinutes }));
    await this.audit.record({ actorAccountId: actor.accountId, action: "event_demo.tags_created_batch", targetType: "event_demo_tag", targetId: null, metadata: { quantity: String(created.length), status: "available" } });
    return created.map((tag) => ({ id: tag.id, internalName: tag.internalName, publicCode: tag.publicCode, sessionDurationMinutes: tag.sessionDurationMinutes }));
  }

  async resetTag(tagId: string) {
    const actor = await requireAdminPermission("event_demo.manage");
    const service = new EventDemoSessionService(undefined, new SupabaseEventDemoPhotoStorage(), undefined, this.audit, async () => undefined);
    const result = await service.resetDemoTag(tagId);
    await this.audit.record({ actorAccountId: actor.accountId, action: result.status === "failed" ? "event_demo.cleanup_failed" : "event_demo.cleanup_completed", targetType: "event_demo_tag", targetId: tagId, result: result.status === "failed" ? "failed" : "success", metadata: { tagId, status: result.status, quantity: "1" } });
    return result;
  }

  async cleanup(limit: number) {
    const actor = await requireAdminPermission("event_demo.manage");
    await this.audit.record({ actorAccountId: actor.accountId, action: "event_demo.cleanup_requested", targetType: "event_demo_session", targetId: null, metadata: { quantity: String(limit), status: "requested" } });
    const service = new EventDemoSessionService(undefined, new SupabaseEventDemoPhotoStorage(), undefined, this.audit, async () => undefined);
    const result = await service.cleanupExpiredDemoSessions(limit);
    await this.audit.record({ actorAccountId: actor.accountId, action: result.failed ? "event_demo.cleanup_failed" : "event_demo.cleanup_completed", targetType: "event_demo_session", targetId: null, result: result.failed ? "failed" : "success", metadata: { quantity: String(result.inspected), status: result.failed ? "partial" : "cleaned" } });
    return result;
  }

  async setEnabled(tagId: string, enabled: boolean) {
    const actor = await requireAdminPermission("event_demo.manage");
    const tag = await this.tags.findById(tagId);
    if (!tag) throw new EventDemoDomainError("tag_not_found");
    if (!enabled && await this.admin.hasActiveSession(tagId)) throw new EventDemoDomainError("tag_unavailable", "Reset this tag before disabling it.");
    const updated = enabled ? await this.tags.enable(tagId) : await this.tags.disable(tagId);
    if (!updated) throw new EventDemoDomainError("tag_not_found");
    await this.audit.record({ actorAccountId: actor.accountId, action: enabled ? "event_demo.tag_enabled" : "event_demo.tag_disabled", targetType: "event_demo_tag", targetId: tagId, metadata: { tagId, status: updated.status, quantity: "1" } });
    return { id: updated.id, status: updated.status, isEnabled: updated.isEnabled };
  }

  async exportTags() { const actor = await requireAdminPermission("event_demo.manage"); await this.audit.record({ actorAccountId: actor.accountId, action: "event_demo.tags_exported", targetType: "event_demo_tag", targetId: null, metadata: { status: "exported", quantity: "0" } }); return this.tags.list(); }
  async exportLeads() { const actor = await requireAdminPermission("event_demo.manage"); const result = await this.leads.listConsented({ page: 1, pageSize: 10_000 }); await this.audit.record({ actorAccountId: actor.accountId, action: "event_demo.leads_exported", targetType: "lead", targetId: null, metadata: { status: "exported", quantity: String(result.total) } }); return result.rows.filter((lead) => lead.source === "event_demo" || lead.source === "fair"); }
}
