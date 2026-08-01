"use server";

import { headers } from "next/headers";

import { createContactRequestSchema } from "../schemas/contact-request";
import { ContactRequestService } from "../services/contact-request-service";
import { isSameOriginRequest } from "@/lib/security/same-origin";

export type ContactRequestActionState={ok:boolean;message:string};
const initialFailure={ok:false,message:"We couldn't submit your request."};
const service=new ContactRequestService();

function fingerprint(requestHeaders:Headers){return requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim()||requestHeaders.get("x-real-ip")?.trim()||"anonymous"}

/** Public action returns no identifiers, raw validation errors or operational details. */
export async function submitContactRequestAction(_previous:ContactRequestActionState,formData:FormData):Promise<ContactRequestActionState>{
  try{
    if(!await isSameOriginRequest())return initialFailure;
    if(String(formData.get("website")??"").trim()){await service.recordInvalidAttempt();return {ok:true,message:"Your message has been sent to the pet owner."}}
    const input=createContactRequestSchema.parse({publicCode:formData.get("publicCode"),finderName:formData.get("finderName"),finderContact:formData.get("finderContact"),message:formData.get("message")});
    await service.create(input,fingerprint(await headers()));
    return {ok:true,message:"Your message has been sent to the pet owner."};
  }catch{return initialFailure}
}
