"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { ActionErrorState } from "@/lib/security/action-state";

import { createPetSchema, petIdSchema, updatePetSchema } from "../schemas/pet";
import {
  createPetService,
  PetAuthorizationError,
  PetDeletionConflictError,
} from "../services/pet-service";

export type PetActionState = ActionErrorState | null;

function getFormValues(formData: FormData) {
  return {
    name: formData.get("name"),
    species: formData.get("species"),
  };
}

function validationState(error: { flatten: () => { fieldErrors: Record<string, string[]> } }): PetActionState {
  return {
    status: "error",
    message: "Please review the highlighted fields.",
    fieldErrors: error.flatten().fieldErrors,
  };
}

function actionError(error: unknown, action: "create" | "update" | "delete"): PetActionState {
  if (error instanceof PetAuthorizationError) {
    return { status: "error", message: "Your session has ended. Please sign in again." };
  }

  if (error instanceof PetDeletionConflictError) {
    return { status: "error", message: "This pet has connected records and can’t be deleted yet." };
  }

  console.error(`Pet ${action} action failed.`);
  return { status: "error", message: "We couldn’t save that change. Please try again." };
}

export async function createPetAction(
  _previousState: PetActionState,
  formData: FormData,
): Promise<PetActionState> {
  const parsed = createPetSchema.safeParse(getFormValues(formData));
  if (!parsed.success) return validationState(parsed.error);

  let petId: string;
  try {
    const pet = await createPetService().createPet(parsed.data);
    petId = pet.id;
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/pets");
  } catch (error) {
    return actionError(error, "create");
  }

  redirect(`/dashboard/pets/${petId}`);
}

export async function updatePetAction(
  petId: string,
  _previousState: PetActionState,
  formData: FormData,
): Promise<PetActionState> {
  if (!petIdSchema.safeParse(petId).success) {
    return { status: "error", message: "We couldn’t find that pet." };
  }

  const parsed = updatePetSchema.safeParse(getFormValues(formData));
  if (!parsed.success) return validationState(parsed.error);

  let updatedPetId: string;
  try {
    const pet = await createPetService().updatePet(petId, parsed.data);
    if (!pet) return { status: "error", message: "We couldn’t find that pet." };

    updatedPetId = pet.id;
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/pets");
    revalidatePath(`/dashboard/pets/${pet.id}`);
  } catch (error) {
    return actionError(error, "update");
  }

  redirect(`/dashboard/pets/${updatedPetId}`);
}

export async function deletePetAction(
  petId: string,
  _previousState: PetActionState,
  _formData: FormData,
): Promise<PetActionState> {
  // The Server Action signature receives state and FormData from useActionState;
  // deletion intentionally derives the target exclusively from the server-bound ID.
  void _previousState;
  void _formData;

  if (!petIdSchema.safeParse(petId).success) {
    return { status: "error", message: "We couldn’t find that pet." };
  }

  try {
    const deleted = await createPetService().deletePet(petId);
    if (!deleted) return { status: "error", message: "We couldn’t find that pet." };

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/pets");
  } catch (error) {
    return actionError(error, "delete");
  }

  redirect("/dashboard/pets");
}
