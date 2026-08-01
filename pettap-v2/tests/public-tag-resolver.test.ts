import { describe, expect, it } from "vitest";
import { PublicTagResolverService } from "@/features/nfc/services/public-tag-resolver-service";
import type { PublicTagRecord, PublicTagRepository } from "@/features/nfc/repositories/public-tag-repository";
import type { PublicPetPhotoService } from "@/features/pets/services/public-pet-photo-service";
import type { PublicTagAuditWriter } from "@/features/nfc/services/public-tag-resolver-service";

const base={tagId:"tag",accountId:"account",petId:"pet",pet:{id:"pet",accountId:"account",name:"Charlie",species:"Dog",publicProfileEnabled:true,archivedAt:null},preferences:{showName:true,showBreed:false,showPhoto:false},photoPath:null,activationCount:1,lostReport:null};
function service(record:PublicTagRecord|null,auditEvents:unknown[]=[]){const repository:Pick<PublicTagRepository,"findByPublicCode">={findByPublicCode:async()=>record};const photos:Pick<PublicPetPhotoService,"sign">={sign:async()=>"https://signed.example/photo"};const audit:PublicTagAuditWriter={write:async(event)=>{auditEvents.push(event)}};return new PublicTagResolverService(repository as PublicTagRepository,photos as PublicPetPhotoService,audit,()=>true)}
describe("public NFC resolver",()=>{
 it("returns neutral state for an unknown tag",async()=>expect(await service(null).resolveByPublicCode({publicCode:"tag-ok",ip:"test"})).toEqual({state:"not_found"}));
 it("allowlists only consented profile data",async()=>expect(await service({...base,status:"active"}).resolveByPublicCode({publicCode:"tag-ok",ip:"test"})).toEqual({state:"active",profile:{name:"Charlie",species:"Dog"}}));
 it.each(["unassigned","suspended","retired"])("handles %s without a profile",async status=>expect((await service({...base,status}).resolveByPublicCode({publicCode:"tag-ok",ip:"other"})).state).not.toBe("active"));
 it("returns a strict Lost DTO only for a matching open report",async()=>expect(await service({...base,status:"lost",lostReport:{petId:"pet",tagId:"tag",openedAt:new Date("2026-07-01T12:00:00Z"),status:"open"}}).resolveByPublicCode({publicCode:"tag-ok",ip:"lost"})).toEqual({state:"lost",profile:{name:"Charlie",reportedAt:"2026-07-01"}}));
 it("fails closed for a lost tag without a matching canonical report",async()=>expect((await service({...base,status:"lost"}).resolveByPublicCode({publicCode:"tag-ok",ip:"missing"})).state).toBe("unavailable"));
 it("does not expose a private profile while lost",async()=>expect(await service({...base,status:"lost",pet:{...base.pet,publicProfileEnabled:false},lostReport:{petId:"pet",tagId:"tag",openedAt:new Date(),status:"open"}}).resolveByPublicCode({publicCode:"tag-ok",ip:"private"})).toEqual({state:"lost",profile:{}}));
 it("audits a Lost view with safe classification metadata only",async()=>{const events:unknown[]=[];await service({...base,status:"lost",lostReport:{petId:"pet",tagId:"tag",openedAt:new Date(),status:"open"}},events).resolveByPublicCode({publicCode:"tag-ok",ip:"audit"});expect(events).toEqual([{state:"lost",tagId:"tag"}]);expect(JSON.stringify(events)).not.toMatch(/Charlie|Dog|details|email|phone|address|signed|storage|tag-ok|credential|hash/i)});
});
