export type PetPhoto = {
  id: string;
  signedUrl: string;
  isPrimary: boolean;
  createdAt: string;
};

export type StoredPetPhoto = {
  id: string;
  petId: string;
  storagePath: string;
  isPrimary: boolean;
  createdAt: Date;
};
