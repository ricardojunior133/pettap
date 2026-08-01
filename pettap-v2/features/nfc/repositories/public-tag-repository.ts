import "server-only";
import { and, eq } from "drizzle-orm";
import { lostReports, nfcTags, pets, petPhotos, petPublicPreferences, tagActivations } from "@/db/schema";
import { createDatabaseClient } from "@/lib/backend/db";

export type PublicLostReportRecord = { id:string; petId:string; tagId:string; openedAt:Date; status:"open" };
export type PublicTagRecord = { tagId:string; status:string; accountId:string|null; petId:string|null; pet:null|{id:string;accountId:string;name:string;species:string;publicProfileEnabled:boolean;archivedAt:Date|null}; preferences:null|{showName:boolean;showBreed:boolean;showPhoto:boolean}; photoPath:string|null; activationCount:number; lostReport:PublicLostReportRecord|null };
/** Read model deliberately excludes credentials, contacts, medical payloads and administrative data. */
export class PublicTagRepository {
  async findOpenLostReportForTag(tagId:string):Promise<PublicLostReportRecord|null>{
    const db=createDatabaseClient();
    // Deliberately allowlisted: report id, actor and details are never selected.
    const reports=await db.select({id:lostReports.id,petId:lostReports.petId,tagId:lostReports.tagId,openedAt:lostReports.openedAt,status:lostReports.status}).from(lostReports).where(and(eq(lostReports.tagId,tagId),eq(lostReports.status,"open"))).limit(2);
    if(reports.length!==1)return null;
    const [report]=reports;
    return {id:report.id,petId:report.petId,tagId:report.tagId!,openedAt:report.openedAt,status:"open"};
  }
  async findByPublicCode(publicCode:string):Promise<PublicTagRecord|null>{const db=createDatabaseClient();const [tag]=await db.select().from(nfcTags).where(eq(nfcTags.publicId,publicCode)).limit(1);if(!tag)return null;const [pet]=tag.petId?await db.select().from(pets).where(eq(pets.id,tag.petId)).limit(1):[];const [prefs]=pet?await db.select().from(petPublicPreferences).where(eq(petPublicPreferences.petId,pet.id)).limit(1):[];const [photo]=pet?await db.select().from(petPhotos).where(and(eq(petPhotos.petId,pet.id),eq(petPhotos.isPrimary,true))).limit(1):[];const activations=await db.select({id:tagActivations.id}).from(tagActivations).where(eq(tagActivations.tagId,tag.id));const lostReport=tag.status==="lost"?await this.findOpenLostReportForTag(tag.id):null;return {tagId:tag.id,status:tag.status,accountId:tag.accountId,petId:tag.petId,pet:pet?{id:pet.id,accountId:pet.accountId,name:pet.name,species:pet.species,publicProfileEnabled:pet.publicProfileEnabled,archivedAt:pet.archivedAt}:null,preferences:prefs?{showName:prefs.showName,showBreed:prefs.showBreed,showPhoto:prefs.showPhoto}:null,photoPath:photo?.storagePath??null,activationCount:activations.length,lostReport};}
}
