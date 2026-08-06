export type PetReadinessInput = { hasPhoto: boolean; hasEmergencyContact: boolean; hasActiveTag: boolean; hasMedicalProfile: boolean };
export type PetReadiness = { percentage: number; completedItems: string[]; missingItems: string[]; nextRecommendedAction: string };
const rules = [
  { key: "hasPhoto", label: "A primary photo", weight: 20, action: "Add a photo" },
  { key: "hasEmergencyContact", label: "An emergency contact", weight: 25, action: "Add an emergency contact" },
  { key: "hasActiveTag", label: "An active PetTap", weight: 35, action: "Activate a tag" },
  { key: "hasMedicalProfile", label: "A medical profile", weight: 20, action: "Add medical information" },
] as const;
export function calculatePetReadiness(input: PetReadinessInput): PetReadiness { const completed = rules.filter(r => input[r.key]); const missing = rules.filter(r => !input[r.key]); return { percentage: Math.max(0, Math.min(100, completed.reduce((total, rule) => total + rule.weight, 0))), completedItems: completed.map(r => r.label), missingItems: missing.map(r => r.label), nextRecommendedAction: missing[0]?.action ?? "Your pet is ready" }; }
