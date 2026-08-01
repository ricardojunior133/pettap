"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { ContactRequestInboxService } from "../services/contact-request-inbox-service";
import { clientRequestKey, checkRateLimit } from "@/lib/security/rate-limit";
import { isSameOriginRequest } from "@/lib/security/same-origin";

type ContactRequestInboxActionState = { ok: boolean; message: string };
const requestIdSchema = z.string().uuid();
const service = new ContactRequestInboxService();

async function guard(requestId: string) {
  requestIdSchema.parse(requestId);
  if (!await isSameOriginRequest()) throw new Error("Request origin is not allowed.");
  const requestHeaders = await headers();
  const limit = checkRateLimit(clientRequestKey(requestHeaders, "contact-request-inbox"), { limit: 12, windowMs: 10 * 60_000 });
  if (!limit.allowed) throw new Error("Rate limited.");
}

async function run(
  requestId: string,
  callback: () => Promise<unknown>,
  successMessage: string,
): Promise<ContactRequestInboxActionState> {
  try {
    await guard(requestId);
    await callback();
    revalidatePath("/account/contact-requests");
    revalidatePath("/account");
    return { ok: true, message: successMessage };
  } catch {
    return { ok: false, message: "We couldn't update this request. Please try again." };
  }
}

/** requestId is bound by a Server Component, never read from browser form data. */
export async function markContactRequestDeliveredAction(requestId: string, _previous: ContactRequestInboxActionState, _formData: FormData) {
  void _previous;
  void _formData;
  return run(requestId, () => service.markDelivered(requestId), "Marked as delivered.");
}

export async function closeContactRequestAction(requestId: string, _previous: ContactRequestInboxActionState, _formData: FormData) {
  void _previous;
  void _formData;
  return run(requestId, () => service.close(requestId), "Request closed.");
}

export async function expireContactRequestAction(requestId: string, _previous: ContactRequestInboxActionState, _formData: FormData) {
  void _previous;
  void _formData;
  return run(requestId, () => service.expire(requestId), "Request expired.");
}
