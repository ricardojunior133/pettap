import "server-only";
import { getAuthorizedPet } from "@/features/pets/services/pet-access";
import { getAuthenticatedAccountId } from "@/features/pets/services/pet-service";
import { DrizzleTagRepository, type TagRepository } from "../repositories/tag-repository";
import { normalizeTagCode, tagIdSchema } from "../schemas/tag";
export class TagNotFoundError extends Error {} export class TagUnavailableError extends Error {}
export class TagService { constructor(private readonly repository:TagRepository=new DrizzleTagRepository(),private readonly account= getAuthenticatedAccountId){} async list(){return this.repository.list(await this.account());} async get(id:string){if(!tagIdSchema.safeParse(id).success)return null;return this.repository.find(id,await this.account());} async activate(code:string,petId:string){const accountId=await this.account(); const {pet}=await getAuthorizedPet(petId); const tag=await this.repository.findByCode(normalizeTagCode(code)); if(!tag)throw new TagNotFoundError(); if(tag.accountId===accountId && tag.petId===pet.id)return tag; if(tag.accountId!==null || tag.status!=="unassigned")throw new TagUnavailableError(); try{return await this.repository.activate(tag.id,accountId,pet.id);}catch{throw new TagUnavailableError();}} }
