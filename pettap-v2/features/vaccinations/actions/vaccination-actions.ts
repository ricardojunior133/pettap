"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { petIdSchema } from "@/features/pets/schemas/pet";
import type { ActionErrorState } from "@/lib/security/action-state";

import { vaccinationIdSchema, vaccinationInputSchema } from "../schemas/vaccination";
import { VaccinationNotFoundError, VaccinationService } from "../services/vaccination-service";

export type VaccinationActionState = ActionErrorState | null;

function input(formData: FormData) {
  return { name: formData.get("name"), administeredAt: formData.get("administeredAt"), expiresAt: formData.get("expiresAt") };
}

function safeError(error: unknown): VaccinationActionState {
  if (error instanceof VaccinationNotFoundError) return { status: "error", message: "We couldn’t find that pet." };
  console.error("Vaccination action failed.");
  return { status: "error", message: "We couldn’t save that vaccination. Please try again." };
}

function revalidatePet(petId: string) {
  revalidatePath(`/dashboard/pets/${petId}`);
  revalidatePath(`/dashboard/pets/${petId}/medical`);
  revalidatePath(`/dashboard/pets/${petId}/vaccinations`);
}

export async function createVaccinationAction(petId: string, _previousState: VaccinationActionState, formData: FormData): Promise<VaccinationActionState> {
  void _previousState;
  if (!petIdSchema.safeParse(petId).success) return { status: "error", message: "We couldn’t find that pet." };
  const parsed = vaccinationInputSchema.safeParse(input(formData));
  if (!parsed.success) return { status: "error", message: "Please review the highlighted fields.", fieldErrors: parsed.error.flatten().fieldErrors };

  try {
    await new VaccinationService().createVaccination(petId, parsed.data);
    revalidatePet(petId);
  } catch (error) {
    return safeError(error);
  }

  redirect(`/dashboard/pets/${petId}/vaccinations`);
}

export async function updateVaccinationAction(petId: string, vaccinationId: string, _previousState: VaccinationActionState, formData: FormData): Promise<VaccinationActionState> {
  void _previousState;
  if (!petIdSchema.safeParse(petId).success || !vaccinationIdSchema.safeParse(vaccinationId).success) return { status: "error", message: "We couldn’t find that vaccination." };
  const parsed = vaccinationInputSchema.safeParse(input(formData));
  if (!parsed.success) return { status: "error", message: "Please review the highlighted fields.", fieldErrors: parsed.error.flatten().fieldErrors };

  try {
    const vaccination = await new VaccinationService().updateVaccination(petId, vaccinationId, parsed.data);
    if (!vaccination) return { status: "error", message: "We couldn’t find that vaccination." };
    revalidatePet(petId);
  } catch (error) {
    return safeError(error);
  }

  redirect(`/dashboard/pets/${petId}/vaccinations`);
}

export async function deleteVaccinationAction(petId: string, vaccinationId: string, _previousState: VaccinationActionState, _formData: FormData): Promise<VaccinationActionState> {
  void _previousState;
  void _formData;
  if (!petIdSchema.safeParse(petId).success || !vaccinationIdSchema.safeParse(vaccinationId).success) return { status: "error", message: "We couldn’t find that vaccination." };

  try {
    const deleted = await new VaccinationService().deleteVaccination(petId, vaccinationId);
    if (!deleted) return { status: "error", message: "We couldn’t find that vaccination." };
    revalidatePet(petId);
    return null;
  } catch (error) {
    return safeError(error);
  }
}
