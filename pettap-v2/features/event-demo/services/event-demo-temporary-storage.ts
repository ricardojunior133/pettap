import "server-only";

export type TemporaryPhotoDeletionResult = { ok: true } | { ok: false; errorCode: string };

export interface EventDemoTemporaryStorage {
  deleteTemporaryPhoto(path: string): Promise<TemporaryPhotoDeletionResult>;
}

/**
 * Production must explicitly inject a Storage adapter. This fails closed rather
 * than pretending an image has been removed.
 */
export class UnavailableEventDemoTemporaryStorage implements EventDemoTemporaryStorage {
  async deleteTemporaryPhoto(): Promise<TemporaryPhotoDeletionResult> {
    return { ok: false, errorCode: "temporary_storage_not_configured" };
  }
}
