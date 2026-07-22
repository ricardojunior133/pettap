export type PetSpecies = "dog" | "cat" | "other";
export type PetSex = "female" | "male" | "unknown";
export type TagStatus = "unassigned" | "active" | "suspended" | "lost" | "retired";
export type LostReportStatus = "open" | "resolved" | "cancelled";
export type ActivityType = "pet_created" | "profile_updated" | "tag_activated" | "contact_updated" | "lost_mode_enabled" | "lost_mode_disabled";

export interface Owner { id: string; displayName: string; email: string; phone?: string; createdAt: string; }
export interface EmergencyContact { id: string; petId: string; name: string; relationship: string; phone: string; email?: string; isPrimary: boolean; }
export interface MedicalInfo { petId: string; allergies?: string; medications?: string; conditions?: string; careInstructions?: string; updatedAt: string; }
export interface Vaccination { id: string; petId: string; name: string; administeredAt: string; expiresAt?: string; provider?: string; }
export interface NfcTag { id: string; publicId: string; status: TagStatus; petId?: string; activatedAt?: string; createdAt: string; }
export interface Pet { id: string; ownerId: string; name: string; species: PetSpecies; breed?: string; sex: PetSex; birthDate?: string; colour?: string; weightKg?: number; photoUrl?: string; microchipNumber?: string; createdAt: string; updatedAt: string; }
export interface LostReport { id: string; petId: string; status: LostReportStatus; lastSeenAt: string; lastSeenLocation?: string; notes?: string; createdAt: string; resolvedAt?: string; }
export interface Activity { id: string; ownerId: string; petId?: string; type: ActivityType; occurredAt: string; metadata?: Record<string, string>; }
export interface AuditLog { id: string; actorId: string; action: string; targetType: string; targetId: string; occurredAt: string; metadata?: Record<string, string>; }
