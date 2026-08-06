"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import { clientRequestKey, checkRateLimit } from "@/lib/security/rate-limit";
import { isSameOriginRequest } from "@/lib/security/same-origin";

import { EventDemoDomainError } from "../domain/errors";
import { eventDemoAdminIdSchema, eventDemoCleanupSchema, createEventDemoTagBatchSchema, createEventDemoTagSchema, eventDemoLeadSearchSchema } from "../schemas/event-demo";
import { EventDemoAdminService } from "../services/event-demo-admin-service";

export type EventDemoAdminActionState = { status: "success" | "error"; message: string; activationUrls?: string[]; cleanup?: { inspected: number; expired: number; cleaned: number; failed: number } };

async function permitted(action: string) {
  const requestHeaders = await headers();
  return await isSameOriginRequest() && checkRateLimit(clientRequestKey(requestHeaders, `event-demo-admin:${action}`), { limit: 30, windowMs: 10 * 60_000 }).allowed;
}
function values(formData: FormData): Record<string, unknown> {
  const result: Record<string, unknown> = Object.fromEntries(formData.entries());
  if (typeof result.sessionDurationMinutes === "string") result.sessionDurationMinutes = Number(result.sessionDurationMinutes);
  if (typeof result.quantity === "string") result.quantity = Number(result.quantity);
  return result;
}
function errorState(error: unknown): EventDemoAdminActionState {
  if (error instanceof EventDemoDomainError && error.code === "tag_unavailable") return { status: "error", message: error.message || "This tag must be reset before it can be disabled." };
  return { status: "error", message: "We couldn't complete that administrative action. Please try again." };
}
function refreshed() { revalidatePath("/admin/event-demo"); }

export async function createEventDemoTag(_: EventDemoAdminActionState | null, formData: FormData): Promise<EventDemoAdminActionState> {
  if (!await permitted("create")) return { status: "error", message: "This action is temporarily unavailable." };
  try { const tag = await new EventDemoAdminService().createTag(createEventDemoTagSchema.parse(values(formData))); refreshed(); return { status: "success", message: "Demo tag created.", activationUrls: [`/event/activate/${tag.publicCode}`] }; } catch (error) { return errorState(error); }
}
export async function createEventDemoTagBatch(_: EventDemoAdminActionState | null, formData: FormData): Promise<EventDemoAdminActionState> {
  if (!await permitted("batch")) return { status: "error", message: "This action is temporarily unavailable." };
  try { const tags = await new EventDemoAdminService().createTagBatch(createEventDemoTagBatchSchema.parse(values(formData))); refreshed(); return { status: "success", message: `${tags.length} demo tags created.`, activationUrls: tags.map((tag) => `/event/activate/${tag.publicCode}`) }; } catch (error) { return errorState(error); }
}
export async function resetEventDemoTag(tagId: string): Promise<EventDemoAdminActionState> {
  if (!await permitted("reset")) return { status: "error", message: "This action is temporarily unavailable." };
  try { const result = await new EventDemoAdminService().resetTag(eventDemoAdminIdSchema.parse(tagId)); refreshed(); return result.status === "failed" ? { status: "error", message: "Cleanup could not be completed. The tag remains unavailable." } : { status: "success", message: "Tag reset and temporary data removed." }; } catch (error) { return errorState(error); }
}
export async function setEventDemoTagEnabled(tagId: string, enabled: boolean): Promise<EventDemoAdminActionState> {
  if (!await permitted("enabled")) return { status: "error", message: "This action is temporarily unavailable." };
  try { await new EventDemoAdminService().setEnabled(eventDemoAdminIdSchema.parse(tagId), enabled); refreshed(); return { status: "success", message: enabled ? "Tag enabled." : "Tag disabled." }; } catch (error) { return errorState(error); }
}
export async function cleanupExpiredEventDemoSessions(limit = 25): Promise<EventDemoAdminActionState> {
  if (!await permitted("cleanup")) return { status: "error", message: "This action is temporarily unavailable." };
  try { const result = await new EventDemoAdminService().cleanup(eventDemoCleanupSchema.parse({ limit }).limit); refreshed(); return { status: result.failed ? "error" : "success", message: result.failed ? "Some sessions could not be cleaned. They remain unavailable." : "Expired sessions cleaned.", cleanup: result }; } catch (error) { return errorState(error); }
}
export async function retryEventDemoCleanup(tagId: string) { return resetEventDemoTag(tagId); }
export async function searchConsentedEventDemoLead(_: EventDemoAdminActionState | null, formData: FormData): Promise<EventDemoAdminActionState & { lead?: { firstName: string | null; email: string; source: string; consentVersion: string | null; consentedAt: string | null } | null }> {
  if (!await permitted("lead-search")) return { status: "error", message: "Search is temporarily unavailable." };
  try { const input = eventDemoLeadSearchSchema.parse(values(formData)); const lead = await new EventDemoAdminService().searchConsentedLead(input.email); return { status: "success", message: lead ? "Consented lead found." : "No consented lead found.", lead }; } catch { return { status: "error", message: "Enter a valid email address." }; }
}
