export type MedicalInformationInput = {
  conditions: string | null;
  medications: string | null;
  allergies: string | null;
  careInstructions: string | null;
};

export type MedicalInformation = MedicalInformationInput & {
  petId: string;
  createdAt: string;
  updatedAt: string;
};
