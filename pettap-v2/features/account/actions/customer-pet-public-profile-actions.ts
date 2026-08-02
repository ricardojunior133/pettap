"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import { clientRequestKey, checkRateLimit } from "@/lib/security/rate-limit";
import { isSameOriginRequest } from "@/lib/security/same-origin";

import { petPublicIdentifierSchema } from "../schemas/customer-pet";
import { customerPetPublicProfileSchema } from "../schemas/customer-pet-public-profile";
import { CustomerPetPublicProfileService } from "../services/customer-pet-public-profile-service";

const service = new CustomerPetPublicProfileService();

export async function saveCustomerPetPublicProfile(petPublicIdentifier: string, formData: FormData) {
  const requestHeaders = await headers();
  if (!await isSameOriginRequest() || !checkRateLimit(clientRequestKey(requestHeaders, "customer-pet-public-profile"), { limit: 12, windowMs: 10 * 60_000 }).allowed) {
    return { ok: false as const };
  }
  try {
    const publicIdentifier = petPublicIdentifierSchema.parse(petPublicIdentifier);
    const input = customerPetPublicProfileSchema.parse({
      enabled: formData.get("enabled") === "on",
      showPhoto: formData.get("showPhoto") === "on",
      showName: formData.get("showName") === "on",
      showBreed: formData.get("showBreed") === "on",
      showAge: formData.get("showAge") === "on",
      publicMessage: String(formData.get("publicMessage") ?? "").trim() || null,
    });
    const profile = await service.save(publicIdentifier, input);
    if (!profile) return { ok: false as const };
    revalidatePath(`/account/pets/${publicIdentifier}/manage`);
    revalidatePath(`/nfc/v1/t/[publicCode]`, "page");
    return { ok: true as const, profile };
  } catch {
    return { ok: false as const };
  }
}
