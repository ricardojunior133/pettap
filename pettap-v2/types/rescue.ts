export type RescueStatus = "normal" | "lost" | "found";
export type RescueTagStatus = "active" | "inactive";
export type PetProfileStatus = "safe-at-home" | "missing" | "travelling" | "veterinary-visit" | "training";

export interface RescueTag { id: string; status: RescueTagStatus; size?: string; shape?: string; colour?: string; material?: string; activationDate?: string; nfcStatus?: "ready" | "inactive"; }
export interface RescuePet { name: string; photo?: string; species?: string; breed: string; age: string; sex: string; colour: string; weight: string; friendly: boolean; microchip: "verified" | "not-provided"; microchipNumber?: string; neutered: boolean; lifestyle?: "Indoor" | "Outdoor" | "Indoor & outdoor"; }
export interface RescueOwner { name: string; phone: string; secondaryPhone?: string; email?: string; availability?: string; }
export interface EmergencyContact { name: string; relationship: string; phone: string; email?: string; availability?: string; }
export interface MedicalInformation { conditions?: string; medication?: string; allergies?: string; notes?: string; }
export interface RescueProfile { tag: RescueTag; pet: RescuePet; owner: RescueOwner; emergencyContacts: EmergencyContact[]; medicalInformation: MedicalInformation; status: RescueStatus; petStatus?: PetProfileStatus; lostMode: boolean; lastUpdated?: string; lastSeenLocation?: string; lastSeenDate?: string; lastSeenTime?: string; rewardAvailable: boolean; rewardText?: string; importantNotes?: string[]; futureFoundDate?: string; }
