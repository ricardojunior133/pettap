import { notFound } from "next/navigation";
import { LostModeOwnerPanel } from "@/features/lost-mode/components/lost-mode-owner-panel";
import { LostModeService } from "@/features/lost-mode/services/lost-mode-service";
import { DrizzleCustomerPetFoundationRepository } from "@/features/account/repositories/customer-pet-foundation-repository";
import { getAuthenticatedAccountId } from "@/features/commerce/services/commerce-account-service";
export default async function AccountPetPage({params}:{params:Promise<{publicIdentifier:string}>}){const accountId=await getAuthenticatedAccountId();const{publicIdentifier}=await params;const pet=await new DrizzleCustomerPetFoundationRepository().findOwnedPetByPublicIdentifier(accountId,publicIdentifier);if(!pet)notFound();const status=await new LostModeService().getStatus(pet.id);return <section aria-labelledby="pet-heading"><p className="text-sm font-semibold uppercase tracking-[.16em] text-neutral-500">Your pet</p><h1 id="pet-heading" className="mt-2 text-4xl font-semibold">{pet.name}</h1><div className="mt-8 max-w-2xl"><LostModeOwnerPanel petId={pet.id} status={status}/></div></section>}
