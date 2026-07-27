"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import { clientRequestKey, checkRateLimit } from "@/lib/security/rate-limit";
import { isSameOriginRequest } from "@/lib/security/same-origin";

import { EVENT_DEMO_CONSENT_VERSION, EVENT_DEMO_MARKETING_CONSENT_VERSION } from "../constants/config";
import { EventDemoDomainError } from "../domain/errors";
import { EventDemoTagRepository } from "../repositories/event-demo-tag-repository";
import { eventDemoSessionPatchSchema, eventDemoPublicCodeSchema } from "../schemas/event-demo";
import { clearEventDemoCookie, readEventDemoCookie, setEventDemoCookie } from "../server/event-demo-cookie";
import { EventDemoPhotoError, SupabaseEventDemoPhotoStorage } from "../services/event-demo-photo-storage";
import { EventDemoPhotoService } from "../services/event-demo-photo-service";
import { EventDemoSessionService } from "../services/event-demo-session-service";

export type EventDemoActionState = { status: "success" | "error"; message: string; step?: "pet" | "photo" | "privacy" | "preview" | "success"; previewUrl?: string | null; sessionPublicId?: string };

function genericError(): EventDemoActionState { return { status: "error", message: "We couldn't complete that request. Please try again." }; }
async function safeActionError(publicCode: string, error: unknown): Promise<EventDemoActionState> {
  if (error instanceof EventDemoDomainError && error.code === "session_expired") {
    await clearEventDemoCookie(publicCode);
    return { status: "error", message: "Your demo session has expired. Tap the PetTap tag again to start a new demonstration." };
  }
  return genericError();
}
async function permitted(namespace: string, limit: number) {
  const requestHeaders = await headers();
  return await isSameOriginRequest() && checkRateLimit(clientRequestKey(requestHeaders, `event-demo:${namespace}`), { limit, windowMs: 10 * 60_000 }).allowed;
}
async function owned(publicCode: string) {
  const cookie = await readEventDemoCookie(publicCode);
  if (!cookie) throw new EventDemoDomainError("invalid_session_token");
  return cookie;
}

export async function startEventDemoSession(publicCode: string): Promise<EventDemoActionState> {
  if (!await permitted("start", 12) || !eventDemoPublicCodeSchema.safeParse(publicCode).success) return genericError();
  const tag = await new EventDemoTagRepository().findByPublicCode(publicCode);
  if (!tag) return genericError();
  try {
    const created = await new EventDemoSessionService(undefined, new SupabaseEventDemoPhotoStorage()).startSessionForTag(tag.id);
    await setEventDemoCookie(publicCode, { publicId: created.session.publicId, token: created.token }, created.session.expiresAt);
    revalidatePath(`/event/activate/${publicCode}`);
    return { status: "success", message: "Your demo has started.", step: "pet" };
  } catch (error) {
    if (error instanceof EventDemoDomainError && error.code === "tag_disabled") return { status: "error", message: "This PetTap tag is not available right now." };
    if (error instanceof EventDemoDomainError && ["tag_unavailable", "active_session_exists"].includes(error.code)) return { status: "error", message: "This demo tag is currently being used. Please try again shortly." };
    return genericError();
  }
}

export async function updateEventDemoPetDetails(publicCode: string, payload: unknown): Promise<EventDemoActionState> {
  if (!await permitted("update", 80)) return genericError();
  try {
    const cookie = await owned(publicCode);
    await new EventDemoSessionService().updateOwnedSession(cookie.publicId, cookie.token, eventDemoSessionPatchSchema.parse(payload));
    return { status: "success", message: "Pet details saved.", step: "photo" };
  } catch (error) { return safeActionError(publicCode, error); }
}

export async function uploadEventDemoPhoto(publicCode: string, formData: FormData): Promise<EventDemoActionState> {
  if (!await permitted("upload", 20)) return genericError();
  const file = formData.get("photo");
  if (!(file instanceof File)) return { status: "error", message: "Choose an image to upload." };
  try {
    const cookie = await owned(publicCode);
    const result = await new EventDemoPhotoService().replaceOwnedPhoto(cookie.publicId, cookie.token, file);
    revalidatePath(`/event/profile/${cookie.publicId}`);
    return { status: "success", message: "Photo saved.", step: "privacy", previewUrl: result.previewUrl };
  } catch (error) {
    if (error instanceof EventDemoPhotoError) return { status: "error", message: error.message };
    return safeActionError(publicCode, error);
  }
}

export async function updateEventDemoContactAndPrivacy(publicCode: string, payload: unknown): Promise<EventDemoActionState> {
  if (!await permitted("privacy", 80)) return genericError();
  try {
    const cookie = await owned(publicCode);
    const patch = eventDemoSessionPatchSchema.parse(payload);
    if (patch.demoConsentAccepted) patch.demoConsentVersion = EVENT_DEMO_CONSENT_VERSION;
    if (patch.marketingConsent) patch.marketingConsentVersion = EVENT_DEMO_MARKETING_CONSENT_VERSION;
    const session = await new EventDemoSessionService().updateOwnedSession(cookie.publicId, cookie.token, patch);
    return { status: "success", message: "Privacy preferences saved.", step: "preview", previewUrl: await new EventDemoPhotoService().getOwnedPreview(session.publicId, cookie.token) };
  } catch (error) { return safeActionError(publicCode, error); }
}

export async function getEventDemoPreview(publicCode: string): Promise<EventDemoActionState> {
  if (!await permitted("preview", 60)) return genericError();
  try {
    const cookie = await owned(publicCode);
    const session = await new EventDemoSessionService().getOwnedSession(cookie.publicId, cookie.token);
    return { status: "success", message: "Preview ready.", step: "preview", previewUrl: await new EventDemoPhotoService().getOwnedPreview(session.publicId, cookie.token) };
  } catch (error) { return safeActionError(publicCode, error); }
}

export async function completeEventDemoProfile(publicCode: string): Promise<EventDemoActionState> {
  if (!await permitted("complete", 20)) return genericError();
  try {
    const cookie = await owned(publicCode);
    await new EventDemoSessionService().markProfileCreated(cookie.publicId, cookie.token);
    const completed = await new EventDemoSessionService().completeOwnedSession(cookie.publicId, cookie.token);
    return { status: "success", message: "Your PetTap profile is ready!", step: "success", sessionPublicId: completed.publicId };
  } catch (error) {
    if (error instanceof EventDemoDomainError && error.code === "photo_pending") return { status: "error", message: "Add a photo before creating your demo profile." };
    return safeActionError(publicCode, error);
  }
}

export async function abandonEventDemoSession(publicCode: string): Promise<EventDemoActionState> {
  if (!await permitted("cancel", 12)) return genericError();
  try {
    const cookie = await owned(publicCode);
    const service = new EventDemoSessionService(undefined, new SupabaseEventDemoPhotoStorage());
    await service.abandonOwnedSession(cookie.publicId, cookie.token);
    await clearEventDemoCookie(publicCode);
    return { status: "success", message: "Your demo has been cancelled." };
  } catch (error) { return safeActionError(publicCode, error); }
}
