import "server-only";

import { EventDemoSessionRepository, type EventDemoSessionRecord } from "../repositories/event-demo-session-repository";
import { eventDemoPublicIdSchema } from "../schemas/event-demo";
import { EventDemoAuditService } from "./event-demo-audit-service";
import { SupabaseEventDemoPhotoStorage, type EventDemoPhotoStorage } from "./event-demo-photo-storage";
import { EventDemoSessionService } from "./event-demo-session-service";

export type EventDemoPublicProfile = {
  sessionPublicId: string;
  petName: string;
  species: "dog" | "cat" | "other";
  photoSignedUrl: string | null;
  breed?: string;
  age?: string;
  personality?: string;
  ownerFirstName?: string;
  contactTelephone?: string;
  contactEmail?: string;
  expiresAt: string;
  badge: "Live Event Demo";
};

export type EventDemoPublicProfileResult = { kind: "profile"; profile: EventDemoPublicProfile } | { kind: "unavailable" | "expired" };

function mapPublicProfile(session: EventDemoSessionRecord, photoSignedUrl: string | null): EventDemoPublicProfile | null {
  if (!session.petName || !session.species) return null;
  return {
    sessionPublicId: session.publicId,
    petName: session.petName,
    species: session.species,
    photoSignedUrl,
    ...(session.showBreed && session.breed ? { breed: session.breed } : {}),
    ...(session.showAge && session.age ? { age: session.age } : {}),
    ...(session.showPersonality && session.personality ? { personality: session.personality } : {}),
    ...(session.showOwnerFirstName && session.ownerFirstName ? { ownerFirstName: session.ownerFirstName } : {}),
    ...(session.showTelephone && session.contactTelephone ? { contactTelephone: session.contactTelephone } : {}),
    ...(session.showEmail && session.contactEmail ? { contactEmail: session.contactEmail } : {}),
    expiresAt: session.expiresAt.toISOString(),
    badge: "Live Event Demo",
  };
}

export class EventDemoPublicProfileService {
  constructor(
    private readonly repository: Pick<EventDemoSessionRepository, "findByPublicId"> = new EventDemoSessionRepository(),
    private readonly lifecycle: Pick<EventDemoSessionService, "expireSessionIfNeeded" | "cleanupExpiredSession"> = new EventDemoSessionService(undefined, new SupabaseEventDemoPhotoStorage()),
    private readonly storage: Pick<EventDemoPhotoStorage, "createPreviewUrl"> = new SupabaseEventDemoPhotoStorage(),
    private readonly audit: Pick<EventDemoAuditService, "record"> = new EventDemoAuditService(),
  ) {}

  async resolve(sessionPublicId: string, now = new Date()): Promise<EventDemoPublicProfileResult> {
    if (!eventDemoPublicIdSchema.safeParse(sessionPublicId).success) return { kind: "unavailable" };
    const session = await this.repository.findByPublicId(sessionPublicId);
    if (!session || session.status === "deleted") return { kind: "unavailable" };
    if (session.expiresAt <= now || session.status === "expired") {
      try {
        await this.lifecycle.expireSessionIfNeeded(session.id, now);
        await this.lifecycle.cleanupExpiredSession(session.id, now);
      } catch {
        await this.audit.record({ action: "event_demo.error", targetType: "event_demo_session", targetId: session.id, result: "failed", metadata: { demoTagId: session.demoTagId, sessionId: session.id, errorCode: "public_expiry_cleanup_failed" } });
      }
      return { kind: "expired" };
    }
    if (session.status !== "completed") return { kind: "unavailable" };
    let photoSignedUrl: string | null = null;
    if (session.photoStoragePath) {
      try { photoSignedUrl = await this.storage.createPreviewUrl(session.photoStoragePath); }
      catch { await this.audit.record({ action: "event_demo.error", targetType: "event_demo_session", targetId: session.id, result: "failed", metadata: { demoTagId: session.demoTagId, sessionId: session.id, errorCode: "public_photo_sign_failed" } }); }
    }
    const profile = mapPublicProfile(session, photoSignedUrl);
    if (!profile) return { kind: "unavailable" };
    await this.audit.record({ action: "event_demo.profile_viewed", targetType: "event_demo_session", targetId: session.id, metadata: { demoTagId: session.demoTagId, sessionId: session.id, status: "completed", source: "event_demo" } });
    return { kind: "profile", profile };
  }
}
