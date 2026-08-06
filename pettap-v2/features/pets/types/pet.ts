export const petSpecies = ["dog", "cat", "other"] as const;

export type PetSpecies = (typeof petSpecies)[number];

/** Safe, serializable representation for pages and Client Components. */
export type Pet = {
  id: string;
  name: string;
  species: PetSpecies;
  publicId: string;
  publicProfileEnabled: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PetInput = {
  name: string;
  species: PetSpecies;
};
