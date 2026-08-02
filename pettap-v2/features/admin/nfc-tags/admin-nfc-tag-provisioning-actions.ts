"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { clientRequestKey, checkRateLimit } from "@/lib/security/rate-limit";
import { isSameOriginRequest } from "@/lib/security/same-origin";

import { AdminNfcTagProvisioningService } from "./admin-nfc-tag-provisioning-service";

const service = new AdminNfcTagProvisioningService();

/** Server-only administrative action; the browser supplies no tag or account identifiers. */
export async function createAdminTestNfcTagAction() {
  const requestHeaders = await headers();
  const allowed = await isSameOriginRequest()
    && checkRateLimit(clientRequestKey(requestHeaders, "admin-nfc-tag-provisioning"), { limit: 6, windowMs: 10 * 60_000 }).allowed;
  if (!allowed) return { ok: false as const };

  try {
    const result = await service.createInitialTestTag();
    if (result.ok) revalidatePath("/admin/tags");
    return result;
  } catch {
    return { ok: false as const };
  }
}
