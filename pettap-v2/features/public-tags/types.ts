export type PublicContactViewModel = { name: string; phone: string };

export type PublicMedicalViewModel = {
  conditions?: string;
  medications?: string;
  specialInstructions?: string;
};

export type PublicPetViewModel = {
  photoUrl?: string;
  name?: string;
};

export type PublicTagResolution =
  | {
      kind: "profile";
      tagId: string;
      status: "active" | "lost";
      pet: PublicPetViewModel;
      medical?: PublicMedicalViewModel;
      primaryContact?: PublicContactViewModel;
      emergencyContacts?: PublicContactViewModel[];
    }
  | { kind: "suspended"; reference: string }
  | { kind: "unknown" }
  | { kind: "rate_limited" }
  | { kind: "orphan"; reference: string };
