import "server-only";
import { createSupabaseServerClient } from "@/lib/backend/supabase/server";
/** Signs an already-authorised storage path; paths never leave this service. */
export class PublicPetPhotoService { async sign(path:string|null):Promise<string|null>{if(!path)return null;try{const client=await createSupabaseServerClient();const {data,error}=await client.storage.from("pet-photos").createSignedUrl(path,300);return error?null:data.signedUrl}catch{return null}}}
