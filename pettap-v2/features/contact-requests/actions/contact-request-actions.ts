"use server";

import { headers } from "next/headers";
import { randomUUID } from "node:crypto";

import { runContactRequestAction, type ContactRequestActionState } from "./contact-request-action-handler";
import { createDefaultContactRequestService } from "../services/contact-request-service";
import { isSameOriginRequest } from "@/lib/security/same-origin";

export type { ContactRequestActionState } from "./contact-request-action-handler";

/** Public action returns no identifiers, raw validation errors or operational details. */
export async function submitContactRequestAction(_previous:ContactRequestActionState,formData:FormData):Promise<ContactRequestActionState>{
  return runContactRequestAction(_previous,formData,{
    createService:createDefaultContactRequestService,
    isSameOriginRequest,
    requestHeaders:headers,
    createCorrelationId:randomUUID,
    logFailure:({correlationId,stage,errorClass})=>console.error("Contact request submission failed.",{correlationId,stage,errorClass}),
  });
}
