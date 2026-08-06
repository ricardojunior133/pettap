import "server-only";

import { createSupabaseAdminClient } from "@/lib/backend/supabase";
import { requireAdminPermission } from "@/lib/auth/require-admin";
import { PET_PHOTOS_BUCKET } from "@/features/photos/constants";

import { DrizzleAdminPetRepository, type AdminPetRepository } from "../repositories/admin-pet-repository";
import type { AdminPetSummaryViewModel } from "../../types/operations";

export class AdminPetNotFoundError extends Error {}

async function signedPhotoUrl(storagePath: string): Promise<string | null> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.storage.from(PET_PHOTOS_BUCKET).createSignedUrl(storagePath, 300);
  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}

export class AdminPetService {
  constructor(
    private readonly repository: AdminPetRepository = new DrizzleAdminPetRepository(),
    private readonly createPhotoUrl = signedPhotoUrl,
  ) {}

  async get(petId: string): Promise<AdminPetSummaryViewModel> {
    await requireAdminPermission("pets.read");
    const pet = await this.repository.findById(petId);
    if (!pet) throw new AdminPetNotFoundError("Pet was not found.");
    return this.toViewModel(pet);
  }

  async listForAccount(accountId: string): Promise<AdminPetSummaryViewModel[]> {
    await requireAdminPermission("pets.read");
    return Promise.all((await this.repository.listForAccount(accountId)).map((pet) => this.toViewModel(pet)));
  }

  private async toViewModel(pet: Awaited<ReturnType<AdminPetRepository["findById"]>> extends infer T ? Exclude<T, null> : never): Promise<AdminPetSummaryViewModel> {
    return { id: pet.id, accountId: pet.accountId, name: pet.name, species: pet.species, publicId: pet.publicId, createdAt: pet.createdAt.toISOString(), lostModeActive: pet.lostModeActive, tagCount: pet.tagCount, primaryPhotoUrl: pet.primaryPhotoPath ? await this.createPhotoUrl(pet.primaryPhotoPath) : null, medicalInformationPresent: pet.medicalInformationPresent };
  }
}
