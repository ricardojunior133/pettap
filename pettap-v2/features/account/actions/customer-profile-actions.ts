"use server";

import { revalidatePath } from "next/cache";

import { customerProfileInputSchema } from "../schemas/profile";
import { AccountPortalService } from "../services/account-portal-service";

export async function getCustomerProfile() { return new AccountPortalService().getProfile(); }

export async function updateCustomerProfile(formData: FormData) {
  const input = customerProfileInputSchema.parse({ displayName: formData.get("displayName"), phone: formData.get("phone") });
  const profile = await new AccountPortalService().updateProfile(input);
  revalidatePath("/account/profile");
  return profile;
}
