export type WizardStepId = "photo" | "basic" | "health" | "contacts" | "review";
export type SetupProgress = WizardStepId | "success";

export interface WizardStep {
  id: WizardStepId;
  label: string;
}

export interface PetHealth {
  vaccinations: string;
  medication: string;
  allergies: string;
  medicalNotes: string;
}

export interface EmergencyContact {
  id: string;
  role: "Primary Contact" | "Secondary Contact" | "Veterinarian";
  name: string;
  phone: string;
  availability?: string;
}

export interface PetSetup {
  petId: string;
  photo: string;
  name: string;
  species: string;
  breed: string;
  gender: string;
  birthDate: string;
  weight: string;
  colour: string;
  microchip: string;
  tagStatus: string;
  health: PetHealth;
  contacts: EmergencyContact[];
  workspaceHref: string;
  rescueHref: string;
}

export interface PetSetupContent {
  title: string;
  description: string;
  steps: WizardStep[];
  photo: { title: string; description: string; action: string; selected: string; continue: string };
  basic: { title: string; description: string; continue: string; labels: Record<"name" | "species" | "breed" | "gender" | "birthDate" | "weight" | "colour" | "microchip", string> };
  health: { title: string; description: string; continue: string; labels: Record<"vaccinations" | "medication" | "allergies" | "medicalNotes", string> };
  contacts: { title: string; description: string; continue: string };
  review: { title: string; description: string; finish: string };
  success: { title: string; description: string; workspace: string; dashboard: string; rescue: string };
}

export interface PetSetupData { setup: PetSetup; content: PetSetupContent; }
