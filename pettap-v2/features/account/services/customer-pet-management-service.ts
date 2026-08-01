import "server-only";

import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import { getServerEnv } from "@/lib/backend/env";
import { getAuthenticatedAccountId } from "@/features/commerce/services/commerce-account-service";
import type { CustomerPetInput } from "../schemas/customer-pet";
import { DrizzleCustomerPetManagementRepository, type CustomerPetManagementRepository, type ManagedPetRecord } from "../repositories/customer-pet-management-repository";

export type CustomerPetViewModel = { publicIdentifier: string; name: string; species: string; breed: string | null; birthDate: string | null; sex: string | null; weight: string | null; colour: string | null; photoUrl: string | null; createdAt: string };
const imageTypes=new Set(["image/jpeg","image/png","image/webp"]);
function view(record: ManagedPetRecord, photoUrl: string | null): CustomerPetViewModel { return {publicIdentifier:record.publicId,name:record.name,species:record.species,breed:record.breed,birthDate:record.birthDate,sex:record.sex,weight:record.weight,colour:record.colour,photoUrl,createdAt:record.createdAt.toISOString()}; }
function publicId(){return `pet_${randomUUID().replaceAll("-","")}`;}
export class CustomerPetManagementService {
  constructor(private readonly repository: CustomerPetManagementRepository=new DrizzleCustomerPetManagementRepository(),private readonly resolveAccountId:()=>Promise<string>=getAuthenticatedAccountId){}
  private async sign(path:string|null){if(!path)return null;const env=getServerEnv();const client=createClient(env.NEXT_PUBLIC_SUPABASE_URL,env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});const {data,error}=await client.storage.from("pet-photos").createSignedUrl(path,300);return error?null:data.signedUrl;}
  private async toView(record:ManagedPetRecord){return view(record,await this.sign(record.photoPath));}
  async list(){return Promise.all((await this.repository.list(await this.resolveAccountId())).map((pet)=>this.toView(pet)));}
  async get(publicIdentifier:string){const pet=await this.repository.find(await this.resolveAccountId(),publicIdentifier);return pet?this.toView(pet):null;}
  async create(input:CustomerPetInput){return this.toView(await this.repository.create(await this.resolveAccountId(),publicId(),input));}
  async update(publicIdentifier:string,input:CustomerPetInput){const pet=await this.repository.update(await this.resolveAccountId(),publicIdentifier,input);return pet?this.toView(pet):null;}
  async remove(publicIdentifier:string){return this.repository.remove(await this.resolveAccountId(),publicIdentifier);}
  async uploadPhoto(publicIdentifier:string,file:File){if(!imageTypes.has(file.type)||file.size<=0||file.size>5*1024*1024)throw new Error("Choose a JPG, PNG or WebP image smaller than 5 MB.");const accountId=await this.resolveAccountId();const pet=await this.repository.find(accountId,publicIdentifier);if(!pet)throw new Error("Pet not found.");const bytes=await sharp(Buffer.from(await file.arrayBuffer()),{limitInputPixels:25_000_000}).rotate().resize({width:1600,height:1600,fit:"inside",withoutEnlargement:true}).webp({quality:84}).toBuffer();const path=`${accountId}/${pet.id}/${randomUUID()}.webp`;const env=getServerEnv();const client=createClient(env.NEXT_PUBLIC_SUPABASE_URL,env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});const payload=new ArrayBuffer(bytes.byteLength);new Uint8Array(payload).set(new Uint8Array(bytes.buffer,bytes.byteOffset,bytes.byteLength));const {error}=await client.storage.from("pet-photos").upload(path,payload,{contentType:"image/webp",cacheControl:"private, max-age=0",upsert:false});if(error)throw new Error("Photo upload failed.");const old=await this.repository.setPrimaryPhoto(accountId,publicIdentifier,path);if(old)await client.storage.from("pet-photos").remove([old]);return this.get(publicIdentifier);}
}
