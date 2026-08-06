"use server";

import { revalidatePath } from "next/cache";

import { petIdSchema } from "@/features/pets/schemas/pet";

import { PhotoLimitError, PhotoNotFoundError, PhotoService } from "../services/photo-service";
import { InvalidPhotoError, PhotoStorageError } from "../services/storage-service";

export type PhotoActionState = { status: "error" | "success"; message: string } | null;

function safeError(error: unknown): PhotoActionState {
  if (error instanceof InvalidPhotoError || error instanceof PhotoLimitError) {
    return { status: "error", message: error.message };
  }
  if (error instanceof PhotoNotFoundError) {
    return { status: "error", message: "We couldn’t find that photo or pet." };
  }
  if (error instanceof PhotoStorageError) {
    return { status: "error", message: "We couldn’t complete that photo change. Please try again." };
  }

  console.error("Pet photo action failed.");
  return { status: "error", message: "We couldn’t complete that photo change. Please try again." };
}

function revalidatePet(petId: string) {
  revalidatePath(`/dashboard/pets/${petId}`);
  revalidatePath("/dashboard/pets");
}

export async function uploadPhotoAction(petId: string, _previousState: PhotoActionState, formData: FormData): Promise<PhotoActionState> {
  if (!petIdSchema.safeParse(petId).success) return { status: "error", message: "We couldn’t find that pet." };
  const file = formData.get("photo");
  if (!(file instanceof File)) return { status: "error", message: "Choose an image to upload." };

  try {
    await new PhotoService().uploadPhoto(petId, file);
    revalidatePet(petId);
    return { status: "success", message: "Photo uploaded." };
  } catch (error) {
    return safeError(error);
  }
}

export async function setPrimaryPhotoAction(petId: string, photoId: string, _previousState: PhotoActionState, _formData: FormData): Promise<PhotoActionState> {
  void _previousState;
  void _formData;
  if (!petIdSchema.safeParse(petId).success || !petIdSchema.safeParse(photoId).success) return { status: "error", message: "We couldn’t find that photo." };

  try {
    await new PhotoService().setPrimaryPhoto(petId, photoId);
    revalidatePet(petId);
    return { status: "success", message: "Primary photo updated." };
  } catch (error) {
    return safeError(error);
  }
}

export async function deletePhotoAction(petId: string, photoId: string, _previousState: PhotoActionState, _formData: FormData): Promise<PhotoActionState> {
  void _previousState;
  void _formData;
  if (!petIdSchema.safeParse(petId).success || !petIdSchema.safeParse(photoId).success) return { status: "error", message: "We couldn’t find that photo." };

  try {
    await new PhotoService().deletePhoto(petId, photoId);
    revalidatePet(petId);
    return { status: "success", message: "Photo deleted." };
  } catch (error) {
    return safeError(error);
  }
}
