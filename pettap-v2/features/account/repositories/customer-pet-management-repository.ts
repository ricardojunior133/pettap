import "server-only";

import { and, desc, eq } from "drizzle-orm";
import { petPhotos, pets } from "@/db/schema";
import { createDatabaseClient } from "@/lib/backend/db";
import type { CustomerPetInput } from "../schemas/customer-pet";

export type ManagedPetRecord = { id: string; publicId: string; name: string; species: string; breed: string | null; birthDate: string | null; sex: string | null; weight: string | null; colour: string | null; photoPath: string | null; createdAt: Date };

const selectPet = { id: pets.id, publicId: pets.publicId, name: pets.name, species: pets.species, breed: pets.breed, birthDate: pets.birthDate, sex: pets.sex, weight: pets.weight, colour: pets.colour, createdAt: pets.createdAt };

export interface CustomerPetManagementRepository { list(accountId: string): Promise<ManagedPetRecord[]>; find(accountId: string, publicId: string): Promise<ManagedPetRecord | null>; create(accountId: string, publicId: string, input: CustomerPetInput): Promise<ManagedPetRecord>; update(accountId: string, publicId: string, input: CustomerPetInput): Promise<ManagedPetRecord | null>; remove(accountId: string, publicId: string): Promise<ManagedPetRecord | null>; setPrimaryPhoto(accountId: string, publicId: string, storagePath: string): Promise<string | null>; }

export class DrizzleCustomerPetManagementRepository implements CustomerPetManagementRepository {
  private async hydrate(row: { id: string; publicId: string; name: string; species: string; breed: string | null; birthDate: string | null; sex: string | null; weight: string | null; colour: string | null; createdAt: Date }): Promise<ManagedPetRecord> { const db=createDatabaseClient(); const [photo]=await db.select({storagePath:petPhotos.storagePath}).from(petPhotos).where(and(eq(petPhotos.petId,row.id),eq(petPhotos.isPrimary,true))).limit(1); return {...row,photoPath:photo?.storagePath??null}; }
  async list(accountId: string) { const db=createDatabaseClient(); const rows=await db.select(selectPet).from(pets).where(eq(pets.accountId,accountId)).orderBy(desc(pets.createdAt)); return Promise.all(rows.map((row)=>this.hydrate(row))); }
  async find(accountId: string, publicId: string) { const db=createDatabaseClient(); const [row]=await db.select(selectPet).from(pets).where(and(eq(pets.accountId,accountId),eq(pets.publicId,publicId))).limit(1); return row?this.hydrate(row):null; }
  async create(accountId: string, publicId: string, input: CustomerPetInput) { const db=createDatabaseClient(); const [row]=await db.insert(pets).values({accountId,publicId,name:input.name,species:input.species,breed:input.breed,birthDate:input.birthDate,sex:input.sex,weight:input.weight,colour:input.colour}).returning(selectPet); return this.hydrate(row); }
  async update(accountId: string, publicId: string, input: CustomerPetInput) { const db=createDatabaseClient(); const [row]=await db.update(pets).set({name:input.name,species:input.species,breed:input.breed,birthDate:input.birthDate,sex:input.sex,weight:input.weight,colour:input.colour,updatedAt:new Date()}).where(and(eq(pets.accountId,accountId),eq(pets.publicId,publicId))).returning(selectPet); return row?this.hydrate(row):null; }
  async remove(accountId: string, publicId: string) { const current=await this.find(accountId,publicId); if(!current)return null; const db=createDatabaseClient(); const [removed]=await db.delete(pets).where(and(eq(pets.accountId,accountId),eq(pets.publicId,publicId))).returning({id:pets.id}); return removed?current:null; }
  async setPrimaryPhoto(accountId: string, publicId: string, storagePath: string) { const db=createDatabaseClient(); return db.transaction(async(tx)=>{const [pet]=await tx.select({id:pets.id}).from(pets).where(and(eq(pets.accountId,accountId),eq(pets.publicId,publicId))).limit(1);if(!pet)return null;const [old]=await tx.select({storagePath:petPhotos.storagePath}).from(petPhotos).where(and(eq(petPhotos.petId,pet.id),eq(petPhotos.isPrimary,true))).limit(1);await tx.update(petPhotos).set({isPrimary:false,updatedAt:new Date()}).where(and(eq(petPhotos.petId,pet.id),eq(petPhotos.isPrimary,true)));await tx.insert(petPhotos).values({petId:pet.id,storagePath,isPrimary:true});return old?.storagePath??null;}); }
}
