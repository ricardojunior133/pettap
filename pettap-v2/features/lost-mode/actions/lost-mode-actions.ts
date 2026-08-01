"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import { LostModeDomainError, LostModeService } from "../services/lost-mode-service";
import { disableLostModeSchema, enableLostModeSchema } from "../schemas/lost-mode";
import { clientRequestKey, checkRateLimit } from "@/lib/security/rate-limit";
import { isSameOriginRequest } from "@/lib/security/same-origin";

type LostModeActionState = { ok: boolean; message: string; state?: string };
const service = new LostModeService();

async function guard(scope: string): Promise<void> {
  const requestHeaders = await headers();
  if (!await isSameOriginRequest()) throw new Error("Request origin is not allowed.");
  const limit = checkRateLimit(clientRequestKey(requestHeaders, `lost-mode:${scope}`), { limit: 10, windowMs: 10 * 60_000 });
  if (!limit.allowed) throw new Error("Please wait a moment before trying again.");
}

function response(error: unknown): LostModeActionState {
  if (error instanceof LostModeDomainError) return { ok: false, message: "We couldn't update Lost Mode. Please check your tag and try again." };
  return { ok: false, message: "Something went wrong. Please try again." };
}

export async function enableLostModeAction(_previous: LostModeActionState, formData: FormData): Promise<LostModeActionState> {
  try { await guard("enable"); const input = enableLostModeSchema.parse({ petId: formData.get("petId"), details: formData.get("details") || undefined }); const result = await service.enable(input); revalidatePath("/account"); revalidatePath("/account/pets", "layout"); return { ok: true, message: result.state === "already_enabled" ? "Lost Mode is already enabled." : "Lost Mode is enabled.", state: result.state }; } catch (error) { return response(error); }
}

export async function disableLostModeAction(_previous: LostModeActionState, formData: FormData): Promise<LostModeActionState> {
  try { await guard("disable"); const input = disableLostModeSchema.parse({ petId: formData.get("petId") }); const result = await service.disable(input); revalidatePath("/account"); revalidatePath("/account/pets", "layout"); return { ok: true, message: result.state === "already_disabled" ? "Lost Mode is already disabled." : "Lost Mode is disabled.", state: result.state }; } catch (error) { return response(error); }
}
