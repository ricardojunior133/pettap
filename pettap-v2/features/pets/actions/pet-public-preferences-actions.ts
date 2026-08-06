"use server";

import { revalidatePath } from "next/cache";

import { petIdSchema } from "../schemas/pet";
import { petPublicPreferencesInputSchema } from "../schemas/pet-public-preferences";
import { PetPublicPreferencesService, PetPublicPreferencesUnavailableError } from "../services/pet-public-preferences-service";

export type PetPublicPreferencesActionState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string; fieldErrors?: Record<string, string[]> };

export const initialPetPublicPreferencesActionState: PetPublicPreferencesActionState = { status: "idle" };

function checkbox(formData: FormData, name: string) {
  return formData.get(name) === "on";
}

export async function updatePetPublicPreferences(
  _previousState: PetPublicPreferencesActionState,
  formData: FormData,
): Promise<PetPublicPreferencesActionState> {
  const petId = petIdSchema.safeParse(formData.get("petId"));
  const input = petPublicPreferencesInputSchema.safeParse({
    publicProfileEnabled: checkbox(formData, "publicProfileEnabled"),
    showPhoto: checkbox(formData, "showPhoto"),
    showName: checkbox(formData, "showName"),
    showBreed: checkbox(formData, "showBreed"),
    showAge: checkbox(formData, "showAge"),
    showMedicalConditions: checkbox(formData, "showMedicalConditions"),
    showMedications: checkbox(formData, "showMedications"),
    showPrimaryContact: checkbox(formData, "showPrimaryContact"),
    showEmergencyContacts: checkbox(formData, "showEmergencyContacts"),
    showSpecialInstructions: checkbox(formData, "showSpecialInstructions"),
  });
  if (!petId.success || !input.success) {
    return { status: "error", message: "Please review your privacy settings and try again." };
  }

  try {
    const result = await new PetPublicPreferencesService().update(petId.data, input.data);
    if (!result) return { status: "error", message: "This pet could not be found." };
    revalidatePath(`/dashboard/pets/${petId.data}`);
    revalidatePath(`/dashboard/pets/${petId.data}/privacy`);
    revalidatePath("/dashboard");
    revalidatePath("/pet/[tagId]", "page");
    return { status: "success", message: "Public sharing preferences saved." };
  } catch (error) {
    if (error instanceof PetPublicPreferencesUnavailableError) {
      return { status: "error", message: "Privacy controls will be available after the scheduled database update." };
    }
    return { status: "error", message: "We could not save these privacy settings. Please try again." };
  }
}
