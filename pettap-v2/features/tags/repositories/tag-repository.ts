import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { nfcTags, tagActivations } from "@/db/schema";
import { createDatabaseClient } from "@/lib/backend/db";
import type { PetTag } from "../types/tag";
const selection = { id: nfcTags.id, publicId: nfcTags.publicId, petId: nfcTags.petId, status: nfcTags.status, createdAt: nfcTags.createdAt, updatedAt: nfcTags.updatedAt };
const map = (row: Pick<typeof nfcTags.$inferSelect, "id" | "publicId" | "petId" | "status" | "createdAt" | "updatedAt">, activatedAt: Date | null = null): PetTag => ({ id: row.id, publicId: row.publicId, petId: row.petId, status: row.status, createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString(), activatedAt: activatedAt?.toISOString() ?? null });
export interface TagRepository { list(accountId: string): Promise<PetTag[]>; find(id: string, accountId: string): Promise<PetTag | null>; findByCode(code: string): Promise<(PetTag & { accountId: string | null }) | null>; activate(id: string, accountId: string, petId: string): Promise<PetTag>; }
export class DrizzleTagRepository implements TagRepository {
 async list(accountId: string) { const db=createDatabaseClient(); const rows=await db.select(selection).from(nfcTags).where(eq(nfcTags.accountId, accountId)).orderBy(desc(nfcTags.updatedAt)); return rows.map((row)=>map(row)); }
 async find(id:string, accountId:string) { const db=createDatabaseClient(); const [row]=await db.select(selection).from(nfcTags).where(and(eq(nfcTags.id,id),eq(nfcTags.accountId,accountId))).limit(1); return row?map(row):null; }
 async findByCode(code:string) { const db=createDatabaseClient(); const [row]=await db.select({ ...selection, accountId:nfcTags.accountId }).from(nfcTags).where(eq(nfcTags.publicId,code)).limit(1); return row?{...map(row),accountId:row.accountId}:null; }
 async activate(id:string, accountId:string, petId:string) { const db=createDatabaseClient(); return db.transaction(async(tx)=>{ const [tag]=await tx.update(nfcTags).set({accountId,petId,status:"active",updatedAt:new Date()}).where(and(eq(nfcTags.id,id),eq(nfcTags.status,"unassigned"))).returning(); if(!tag) throw new Error("TAG_UNAVAILABLE"); await tx.insert(tagActivations).values({tagId:id,accountId,status:"active"}); return map(tag,new Date()); }); }
}
