"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { petIdSchema } from "@/features/pets/schemas/pet";
import type { ActionErrorState } from "@/lib/security/action-state";

import { medicalInformationSchema } from "../schemas/medical";
import { MedicalEncryptionError, MedicalNotFoundError, MedicalService } from "../services/medical-service";

export type MedicalActionState = ActionErrorState | null;

function formValues(formData: FormData) {
  return {
    conditions: formData.get("conditions"),
    medications: formData.get("medications"),
    allergies: formData.get("allergies"),
    careInstructions: formData.get("careInstructions"),
  };
}

function actionError(error: unknown): MedicalActionState {
  if (error instanceof MedicalNotFoundError) return { status: "error", message: "We couldn’t find that pet." };
  if (error instanceof MedicalEncryptionError) return { status: "error", message: "Medical information is not configured yet." };
  console.error("Medical information action failed.");
  return { status: "error", message: "We couldn’t save medical information. Please try again." };
}

async function saveMedical(petId: string, formData: FormData): Promise<MedicalActionState> {
  if (!petIdSchema.safeParse(petId).success) return { status: "error", message: "We couldn’t find that pet." };
  const parsed = medicalInformationSchema.safeParse(formValues(formData));
  if (!parsed.success) return { status: "error", message: "Please review the highlighted fields.", fieldErrors: parsed.error.flatten().fieldErrors };

  try {
    await new MedicalService().saveMedicalInformation(petId, parsed.data);
    revalidatePath(`/dashboard/pets/${petId}`);
    revalidatePath(`/dashboard/pets/${petId}/medical`);
  } catch (error) {
    return actionError(error);
  }

  redirect(`/dashboard/pets/${petId}/medical`);
}

export async function createMedicalAction(petId: string, _previousState: MedicalActionState, formData: FormData) {
  void _previousState;
  return saveMedical(petId, formData);
}

export async function updateMedicalAction(petId: string, _previousState: MedicalActionState, formData: FormData) {
  void _previousState;
  return saveMedical(petId, formData);
}
