"use server";

import { revalidatePath } from "next/cache";

import { customerProfileInputSchema } from "../schemas/customer-profile";
import { CustomerProfileAuthorizationError, CustomerProfileService } from "../services/customer-profile-service";

export type CustomerProfileActionState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string; fieldErrors?: Record<string, string[]> };

export const initialCustomerProfileActionState: CustomerProfileActionState = { status: "idle" };

export async function updateCustomerProfile(
  _previousState: CustomerProfileActionState,
  formData: FormData,
): Promise<CustomerProfileActionState> {
  const parsed = customerProfileInputSchema.safeParse({
    displayName: formData.get("displayName"),
    phone: formData.get("phone"),
    preferredLanguage: formData.get("preferredLanguage"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please review the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await new CustomerProfileService().updateProfile(parsed.data);
    revalidatePath("/dashboard/profile");
    revalidatePath("/dashboard");
    return { status: "success", message: "Your profile has been saved." };
  } catch (error) {
    if (error instanceof CustomerProfileAuthorizationError) {
      return { status: "error", message: "Please sign in again to update your profile." };
    }

    return { status: "error", message: "We could not save your profile. Please try again." };
  }
}
