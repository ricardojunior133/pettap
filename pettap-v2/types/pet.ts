export type PetMicrochipStatus = "verified" | "not-provided";

export interface Pet {
  id: string;
  ownerId?: string;
  tagId?: string;
  name: string;
  species?: string;
  breed: string;
  photo?: string;
  age?: string;
  sex?: string;
  colour?: string;
  weight?: string;
}
