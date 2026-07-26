import "server-only";

import { EventDemoDomainError } from "../domain/errors";
import { EventDemoSessionRepository } from "../repositories/event-demo-session-repository";
import { EventDemoAuditService } from "./event-demo-audit-service";
import { buildEventDemoPhotoPath, SupabaseEventDemoPhotoStorage, type EventDemoPhotoStorage } from "./event-demo-photo-storage";
import { EventDemoSessionService } from "./event-demo-session-service";

export class EventDemoPhotoService {
  constructor(
    private readonly sessions: Pick<EventDemoSessionService, "getOwnedSession"> = new EventDemoSessionService(),
    private readonly repository: Pick<EventDemoSessionRepository, "update"> = new EventDemoSessionRepository(),
    private readonly storage: EventDemoPhotoStorage = new SupabaseEventDemoPhotoStorage(),
    private readonly audit: Pick<EventDemoAuditService, "record"> = new EventDemoAuditService(),
  ) {}

  async replaceOwnedPhoto(publicId: string, token: string, file: File): Promise<{ previewUrl: string }> {
    const session = await this.sessions.getOwnedSession(publicId, token);
    const path = buildEventDemoPhotoPath(session.demoTagId, session.id);
    await this.storage.uploadTemporaryPhoto(path, file);
    const previousPath = session.photoStoragePath;
    try {
      const updated = await this.repository.update(session.id, { photoStoragePath: path });
      if (!updated) throw new EventDemoDomainError("session_not_found");
    } catch (error) {
      await this.storage.deleteTemporaryPhoto(path);
      throw error;
    }
    if (previousPath) {
      const deletion = await this.storage.deleteTemporaryPhoto(previousPath);
      if (!deletion.ok) await this.audit.record({ action: "event_demo.error", targetType: "event_demo_session", targetId: session.id, result: "failed", metadata: { demoTagId: session.demoTagId, sessionId: session.id, errorCode: deletion.errorCode } });
    }
    await this.audit.record({ action: "event_demo.photo_uploaded", targetType: "event_demo_session", targetId: session.id, metadata: { demoTagId: session.demoTagId, sessionId: session.id, status: "photo_uploaded" } });
    return { previewUrl: await this.storage.createPreviewUrl(path) };
  }

  async getOwnedPreview(publicId: string, token: string): Promise<string | null> {
    const session = await this.sessions.getOwnedSession(publicId, token);
    return session.photoStoragePath ? this.storage.createPreviewUrl(session.photoStoragePath) : null;
  }
}
