import type { Account, AuditLog, NfcTag, Owner, Pet, PublicPetProfile, TagActivation } from "@/types/platform";

export interface AuthService { getCurrentOwner(): Promise<Owner | null>; signOut(): Promise<void>; }
export interface PetService { listByOwner(ownerId: string): Promise<Pet[]>; getById(ownerId: string, petId: string): Promise<Pet | null>; create(ownerId: string, pet: Omit<Pet, "id" | "ownerId" | "createdAt" | "updatedAt">): Promise<Pet>; }
export interface OwnerService { get(ownerId: string): Promise<Owner | null>; update(ownerId: string, owner: Partial<Owner>): Promise<Owner>; }
export interface TagService { validateIdentifier(identifier: string): Promise<NfcTag>; beginActivation(ownerId: string, tagId: string): Promise<TagActivation>; }
export interface ProfileService { getPublicProfile(publicId: string): Promise<PublicPetProfile | null>; }
export interface NotificationService { sendOwnerAlert(ownerId: string, message: string): Promise<void>; }
export interface UploadService { createPetPhotoUpload(ownerId: string, petId: string): Promise<{ uploadUrl: string; assetUrl: string }>; }
export interface AuditService { write(entry: Omit<AuditLog, "id" | "occurredAt">): Promise<void>; }
export interface AccountService { get(ownerId: string): Promise<Account | null>; }
