import "server-only";

import type { EventDemoSession } from "@/db/schema";
import { AdminAuthorizationService } from "@/features/admin/services/admin-authorization-service";

import { EventDemoDomainError } from "../domain/errors";
import { assertEventDemoSessionTransition } from "../domain/state-machine";
import { EventDemoSessionRepository, type EventDemoSessionRecord } from "../repositories/event-demo-session-repository";
import { EventDemoTagRepository } from "../repositories/event-demo-tag-repository";
import { eventDemoSessionPatchSchema, type EventDemoSessionPatchInput } from "../schemas/event-demo";
import { generateEventDemoPublicId, generateEventDemoSessionToken, hashEventDemoSessionToken, verifyEventDemoSessionToken } from "../security/tokens";
import type { EventDemoTemporaryStorage } from "./event-demo-temporary-storage";
import { UnavailableEventDemoTemporaryStorage } from "./event-demo-temporary-storage";
import { LeadService } from "./lead-service";
import { EventDemoAuditService } from "./event-demo-audit-service";

type SessionRepositoryPort = Pick<EventDemoSessionRepository, "startForTag" | "findById" | "findByPublicId" | "findLatestByTagId" | "update" | "expireWithTag" | "completeWithTag" | "finalizeCleanup" | "listExpiredCandidates">;
type TagRepositoryPort = Pick<EventDemoTagRepository, "resetToAvailable">;
type EventDemoManageAuthorizer = () => Promise<void>;

export type EventDemoSessionView = Omit<EventDemoSessionRecord, "sessionTokenHash" | "photoStoragePath" | "contactTelephone" | "contactEmail">;
export type CleanupResult = { status: "cleaned" | "already_clean" } | { status: "failed"; errorCode: string };
export type CleanupBatchResult = { inspected: number; expired: number; cleaned: number; failed: number };

function publicSession(session: EventDemoSessionRecord): EventDemoSessionView {
  const value = { ...session };
  Reflect.deleteProperty(value, "sessionTokenHash");
  Reflect.deleteProperty(value, "photoStoragePath");
  Reflect.deleteProperty(value, "contactTelephone");
  Reflect.deleteProperty(value, "contactEmail");
  return value;
}

function permissionErrorForStart(kind: Exclude<Awaited<ReturnType<EventDemoSessionRepository["startForTag"]>>["kind"], "started" | "expired_session_requires_cleanup">): EventDemoDomainError {
  return new EventDemoDomainError(kind === "tag_not_found" ? "tag_not_found" : kind === "tag_disabled" ? "tag_disabled" : "tag_unavailable");
}

export class EventDemoSessionService {
  constructor(
    private readonly repository: SessionRepositoryPort = new EventDemoSessionRepository(),
    private readonly storage: EventDemoTemporaryStorage = new UnavailableEventDemoTemporaryStorage(),
    private readonly leadService: Pick<LeadService, "upsertMarketingLead"> = new LeadService(),
    private readonly audit: Pick<EventDemoAuditService, "record"> = new EventDemoAuditService(),
    private readonly authorizeEventDemoManage: EventDemoManageAuthorizer = async () => {
      await new AdminAuthorizationService().requirePermission("event_demo.manage");
    },
    private readonly tags: TagRepositoryPort = new EventDemoTagRepository(),
  ) {}

  async startSessionForTag(demoTagId: string, now = new Date()): Promise<{ session: EventDemoSessionView; token: string }> {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const token = generateEventDemoSessionToken();
      const result = await this.repository.startForTag({ demoTagId, publicId: generateEventDemoPublicId(), sessionTokenHash: hashEventDemoSessionToken(token), now });
      if (result.kind === "started") return { session: publicSession(result.session), token };
      if (result.kind === "expired_session_requires_cleanup") {
        const cleanup = await this.cleanupExpiredSession(result.sessionId, now);
        if (cleanup.status === "failed") throw new EventDemoDomainError("cleanup_failed");
        continue;
      }
      throw permissionErrorForStart(result.kind);
    }
    throw new EventDemoDomainError("active_session_exists");
  }

  async verifySessionAccess(publicId: string, token: string, now = new Date()): Promise<EventDemoSessionView> {
    const session = await this.repository.findByPublicId(publicId);
    if (!session) throw new EventDemoDomainError("session_not_found");
    if (!verifyEventDemoSessionToken(token, session.sessionTokenHash)) throw new EventDemoDomainError("invalid_session_token");
    if (await this.isExpired(session, now)) {
      await this.expireSessionIfNeeded(session.id, now);
      throw new EventDemoDomainError("session_expired");
    }
    return publicSession(session);
  }

  async getOwnedSession(publicId: string, token: string, now = new Date()): Promise<EventDemoSessionRecord> {
    await this.verifySessionAccess(publicId, token, now);
    const session = await this.repository.findByPublicId(publicId);
    if (!session) throw new EventDemoDomainError("session_not_found");
    return session;
  }

  async updateOwnedSession(publicId: string, token: string, patch: EventDemoSessionPatchInput, now = new Date()): Promise<EventDemoSessionView> {
    const current = await this.getOwnedSession(publicId, token, now);
    const validated = eventDemoSessionPatchSchema.parse(patch);
    const next = { ...current, ...validated };
    const visibility = validated.visibility ? {
      showOwnerFirstName: validated.visibility.showOwnerFirstName,
      showTelephone: validated.visibility.showTelephone,
      showEmail: validated.visibility.showEmail,
      showBreed: validated.visibility.showBreed,
      showAge: validated.visibility.showAge,
      showPersonality: validated.visibility.showPersonality,
    } : {};
    if ((visibility.showOwnerFirstName && !next.ownerFirstName) || (visibility.showTelephone && !next.contactTelephone) || (visibility.showEmail && !next.contactEmail) || (visibility.showBreed && !next.breed) || (visibility.showAge && !next.age) || (visibility.showPersonality && !next.personality)) {
      throw new EventDemoDomainError("invalid_state_transition", "A visible field must have a value.");
    }
    const marketingAcceptedAt = validated.marketingConsent === true && !current.marketingConsent ? now : current.marketingConsentAt;
    const demoAcceptedAt = validated.demoConsentAccepted === true && !current.demoConsentAccepted ? now : current.demoConsentAcceptedAt;
    const updated = await this.repository.update(current.id, {
      petName: validated.petName,
      species: validated.species,
      breed: validated.breed,
      age: validated.age,
      personality: validated.personality,
      ownerFirstName: validated.ownerFirstName,
      contactTelephone: validated.contactTelephone,
      contactEmail: validated.contactEmail,
      ...visibility,
      demoConsentAccepted: validated.demoConsentAccepted,
      demoConsentVersion: validated.demoConsentVersion,
      demoConsentAcceptedAt: demoAcceptedAt,
      marketingConsent: validated.marketingConsent,
      marketingConsentVersion: validated.marketingConsentVersion,
      marketingConsentAt: marketingAcceptedAt,
    });
    if (!updated) throw new EventDemoDomainError("session_not_found");
    return publicSession(updated);
  }

  /** Records profile data as complete while deliberately awaiting the future Storage upload step. */
  async markProfileCreated(publicId: string, token: string, now = new Date()): Promise<EventDemoSessionView> {
    const session = await this.getOwnedSession(publicId, token, now);
    if (!session.petName || !session.species || !session.demoConsentAccepted || !session.demoConsentVersion || !session.demoConsentAcceptedAt) throw new EventDemoDomainError("consent_required");
    assertEventDemoSessionTransition(session.status, "profile_created");
    const updated = await this.repository.update(session.id, { status: "profile_created" });
    if (!updated) throw new EventDemoDomainError("session_not_found");
    await this.audit.record({ action: "event_demo.profile_created", targetType: "event_demo_session", targetId: updated.id, metadata: { demoTagId: updated.demoTagId, sessionId: updated.id, status: updated.status } });
    return publicSession(updated);
  }

  async completeOwnedSession(publicId: string, token: string, source: "event_demo" | "fair" = "event_demo", now = new Date()): Promise<EventDemoSessionView> {
    const session = await this.getOwnedSession(publicId, token, now);
    if (!session.petName || !session.species || !session.demoConsentAccepted || !session.demoConsentVersion || !session.demoConsentAcceptedAt) throw new EventDemoDomainError("consent_required");
    if (!session.photoStoragePath) throw new EventDemoDomainError("photo_pending");
    if (session.marketingConsent && !session.contactEmail) throw new EventDemoDomainError("marketing_email_required");
    assertEventDemoSessionTransition(session.status, "completed");
    const updated = await this.repository.completeWithTag(session.id, now);
    if (!updated) throw new EventDemoDomainError("session_not_found");
    if (updated.marketingConsent && updated.contactEmail) {
      await this.leadService.upsertMarketingLead({ email: updated.contactEmail, firstName: updated.ownerFirstName, source, marketingConsent: true, consentVersion: updated.marketingConsentVersion }, now);
      await this.audit.record({ action: "event_demo.lead_created", targetType: "lead", targetId: null, metadata: { demoTagId: updated.demoTagId, sessionId: updated.id, source } });
    }
    return publicSession(updated);
  }

  async expireSessionIfNeeded(id: string, now = new Date()): Promise<EventDemoSessionView | null> {
    const session = await this.repository.findById(id);
    if (!session) throw new EventDemoDomainError("session_not_found");
    if (session.status === "deleted" || session.status === "expired") return publicSession(session);
    if (session.expiresAt > now) return null;
    const expired = await this.repository.expireWithTag(id, now);
    return expired ? publicSession(expired) : null;
  }

  async cleanupExpiredSession(id: string, now = new Date()): Promise<CleanupResult> {
    const session = await this.repository.findById(id);
    if (!session) throw new EventDemoDomainError("session_not_found");
    if (session.status === "deleted") return { status: "already_clean" };
    if (session.photoStoragePath) {
      const deletion = await this.storage.deleteTemporaryPhoto(session.photoStoragePath);
      if (!deletion.ok) {
        await this.audit.record({ action: "event_demo.error", targetType: "event_demo_session", targetId: session.id, result: "failed", metadata: { demoTagId: session.demoTagId, sessionId: session.id, errorCode: deletion.errorCode } });
        return { status: "failed", errorCode: deletion.errorCode };
      }
    }
    const cleaned = await this.repository.finalizeCleanup(id, now);
    if (!cleaned) throw new EventDemoDomainError("session_not_found");
    return { status: "cleaned" };
  }

  async resetDemoTag(demoTagId: string, now = new Date()): Promise<CleanupResult> {
    await this.authorizeEventDemoManage();
    const latest = await this.repository.findLatestByTagId(demoTagId);
    if (!latest || latest.status === "deleted") {
      const tag = await this.tags.resetToAvailable(demoTagId, now);
      if (!tag) throw new EventDemoDomainError("tag_not_found");
      await this.audit.record({ action: "event_demo.tag_reset", targetType: "event_demo_tag", targetId: demoTagId, metadata: { demoTagId, sessionId: latest?.id ?? null, status: "available" } });
      return { status: "already_clean" };
    }
    const result = await this.cleanupExpiredSession(latest.id, now);
    if (result.status !== "failed") await this.audit.record({ action: "event_demo.tag_reset", targetType: "event_demo_tag", targetId: demoTagId, metadata: { demoTagId, sessionId: latest.id, status: "available" } });
    else await this.audit.record({ action: "event_demo.error", targetType: "event_demo_tag", targetId: demoTagId, result: "failed", metadata: { demoTagId, sessionId: latest.id, errorCode: result.errorCode } });
    return result;
  }

  async cleanupExpiredDemoSessions(limit: number, now = new Date()): Promise<CleanupBatchResult> {
    const candidates = await this.repository.listExpiredCandidates(now);
    const batch = candidates.slice(0, Math.max(1, Math.min(limit, 100)));
    let expired = 0;
    let cleaned = 0;
    let failed = 0;
    for (const session of batch) {
      try {
        if (session.status !== "expired") {
          await this.expireSessionIfNeeded(session.id, now);
          expired += 1;
        }
        const result = await this.cleanupExpiredSession(session.id, now);
        if (result.status === "cleaned" || result.status === "already_clean") cleaned += 1;
        else failed += 1;
      } catch {
        failed += 1;
      }
    }
    return { inspected: batch.length, expired, cleaned, failed };
  }

  async abandonOwnedSession(publicId: string, token: string, now = new Date()): Promise<CleanupResult> {
    const session = await this.getOwnedSession(publicId, token, now);
    await this.repository.expireWithTag(session.id, now);
    return this.cleanupExpiredSession(session.id, now);
  }

  async isExpired(session: Pick<EventDemoSession, "expiresAt" | "status" | "deletedAt">, now = new Date()): Promise<boolean> {
    return session.deletedAt !== null || session.status === "expired" || session.status === "deleted" || session.expiresAt <= now;
  }
}
