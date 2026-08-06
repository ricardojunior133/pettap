"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { petIdSchema } from "@/features/pets/schemas/pet";
import type { ActionErrorState } from "@/lib/security/action-state";

import {
  emergencyContactIdSchema,
  emergencyContactInputSchema,
} from "../schemas/emergency-contact";
import {
  EmergencyContactLimitError,
  EmergencyContactNotFoundError,
  EmergencyContactService,
} from "../services/emergency-contact-service";

export type EmergencyContactActionState = ActionErrorState | null;

function readFormData(data: FormData) {
  return {
    name: data.get("name"),
    relationship: data.get("relationship"),
    phone: data.get("phone"),
    isPrimary: data.get("isPrimary") === "on",
  };
}

function revalidateEmergencyContacts(petId: string) {
  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/pets/${petId}`);
  revalidatePath(`/dashboard/pets/${petId}/contacts`);
}

function errorState(error: unknown): EmergencyContactActionState {
  if (error instanceof EmergencyContactLimitError) {
    return {
      status: "error",
      message: "You have reached the maximum number of emergency contacts for this pet.",
    };
  }

  if (error instanceof EmergencyContactNotFoundError) {
    return { status: "error", message: "We couldn’t find that pet." };
  }

  console.error("Emergency contact action failed.");
  return {
    status: "error",
    message: "We couldn’t save this contact. Please try again.",
  };
}

export async function createEmergencyContactAction(
  petId: string,
  _previousState: EmergencyContactActionState,
  formData: FormData,
): Promise<EmergencyContactActionState> {
  void _previousState;

  if (!petIdSchema.safeParse(petId).success) {
    return { status: "error", message: "We couldn’t find that pet." };
  }

  const parsed = emergencyContactInputSchema.safeParse(readFormData(formData));
  if (!parsed.success) {
    return {
      status: "error",
      message: "Please review the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await new EmergencyContactService().create(petId, parsed.data);
    revalidateEmergencyContacts(petId);
  } catch (error) {
    return errorState(error);
  }

  redirect(`/dashboard/pets/${petId}/contacts`);
}

export async function updateEmergencyContactAction(
  petId: string,
  contactId: string,
  _previousState: EmergencyContactActionState,
  formData: FormData,
): Promise<EmergencyContactActionState> {
  void _previousState;

  if (
    !petIdSchema.safeParse(petId).success ||
    !emergencyContactIdSchema.safeParse(contactId).success
  ) {
    return { status: "error", message: "We couldn’t find that contact." };
  }

  const parsed = emergencyContactInputSchema.safeParse(readFormData(formData));
  if (!parsed.success) {
    return {
      status: "error",
      message: "Please review the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const contact = await new EmergencyContactService().update(
      petId,
      contactId,
      parsed.data,
    );
    if (!contact) {
      return { status: "error", message: "We couldn’t find that contact." };
    }

    revalidateEmergencyContacts(petId);
  } catch (error) {
    return errorState(error);
  }

  redirect(`/dashboard/pets/${petId}/contacts`);
}

export async function deleteEmergencyContactAction(
  petId: string,
  contactId: string,
  _previousState: EmergencyContactActionState,
  formData: FormData,
): Promise<EmergencyContactActionState> {
  void _previousState;
  void formData;

  if (
    !petIdSchema.safeParse(petId).success ||
    !emergencyContactIdSchema.safeParse(contactId).success
  ) {
    return { status: "error", message: "We couldn’t find that contact." };
  }

  try {
    const deleted = await new EmergencyContactService().delete(petId, contactId);
    if (!deleted) {
      return { status: "error", message: "We couldn’t find that contact." };
    }

    revalidateEmergencyContacts(petId);
    return null;
  } catch (error) {
    return errorState(error);
  }
}
