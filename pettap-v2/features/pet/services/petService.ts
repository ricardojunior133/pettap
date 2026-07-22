import { getMockPetWorkspace, getMockPetWorkspaceIds } from "@/lib/dashboard";

/** Temporary read adapter for pet workspace mock data. */
export function getPetWorkspaceById(petId: string) {
  return getMockPetWorkspace(petId);
}

export function getPetWorkspaceIds() {
  return getMockPetWorkspaceIds();
}
