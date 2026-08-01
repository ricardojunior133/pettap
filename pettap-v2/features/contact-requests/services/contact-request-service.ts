import "server-only";
import { createHash } from "node:crypto";
import { allowFinderContact } from "../contact-request-rate-limit";
import { DrizzleContactRequestRepository, type ContactRequestRepository } from "../repositories/contact-request-repository";
import type { CreateContactRequestInput } from "../schemas/contact-request";
import { PublicTagRepository } from "@/features/nfc/repositories/public-tag-repository";
import { ContactRequestNotificationService } from "@/features/contact-request-notifications/contact-request-notification-service";

export class ContactRequestError extends Error { constructor(readonly code:"RATE_LIMITED"|"UNAVAILABLE"|"INVALID") { super("We couldn't send your request. Please try again later."); } }
export type ContactRequestResult={accepted:true};
type FingerprintHasher=(input:string)=>string;
export interface ContactRequestNotificationEnqueuer { enqueueForContactRequest(contactRequestId:string):Promise<unknown>; }

/** Persists a private request only after the public Lost state is revalidated server-side. */
export class ContactRequestService {
  constructor(private readonly contacts:ContactRequestRepository=new DrizzleContactRequestRepository(),private readonly tags:Pick<PublicTagRepository,"findByPublicCode">=new PublicTagRepository(),private readonly rateLimit=allowFinderContact,private readonly hash:FingerprintHasher=(value)=>createHash("sha256").update(value).digest("hex"),private readonly notifications:ContactRequestNotificationEnqueuer=new ContactRequestNotificationService()){}
  async create(input:CreateContactRequestInput,actorFingerprint:string):Promise<ContactRequestResult>{
    if(!this.rateLimit(actorFingerprint)){await this.safeAudit({action:"contact.request.denied",tagId:null,lostReportId:null,result:"denied",reason:"rate_limited"});throw new ContactRequestError("RATE_LIMITED")}
    const tag=await this.tags.findByPublicCode(input.publicCode);
    const report=tag?.lostReport;
    if(!tag||tag.status!=="lost"||!tag.pet||!tag.petId||!tag.pet.publicProfileEnabled||!report||report.status!=="open"||report.petId!==tag.pet.id||report.tagId!==tag.tagId){await this.safeAudit({action:"contact.request.denied",tagId:tag?.tagId??null,lostReportId:report?.id??null,result:"denied",reason:"lost_state_unavailable"});throw new ContactRequestError("UNAVAILABLE")}
    const request=await this.contacts.createContactRequest({lostReportId:report.id,petId:tag.pet.id,tagId:tag.tagId,finderName:input.finderName,finderContact:input.finderContact,message:input.message,actorHash:this.hash(actorFingerprint)});
    // A delivery fault never rolls back a persisted finder request; the inbox is
    // the canonical fallback and the notification service writes safe audits.
    try{await this.notifications.enqueueForContactRequest(request.id)}catch{}
    return {accepted:true};
  }
  async recordInvalidAttempt(){await this.safeAudit({action:"contact.request.invalid",tagId:null,lostReportId:null,result:"denied",reason:"honeypot"})}
  private async safeAudit(event:Parameters<ContactRequestRepository["recordAudit"]>[0]){try{await this.contacts.recordAudit(event)}catch{/* public caller receives the same safe result */}}
}
