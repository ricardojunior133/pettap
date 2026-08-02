"use server";

import { revalidatePath } from "next/cache";

import { customerPetTagPublicIdentifierSchema } from "../schemas/customer-pet-tag-link";
import { CustomerPetTagActivationService } from "../services/customer-pet-tag-activation-service";

const service = new CustomerPetTagActivationService();

/** Activates only the tag already linked to the authenticated account's pet. */
export async function activateCustomerPetTag(petPublicIdentifier: string) {
  const petId = customerPetTagPublicIdentifierSchema.parse(petPublicIdentifier);
  const result = await service.activate(petId);
  if (result.ok) {
    revalidatePath("/account");
    revalidatePath("/account/pets");
    revalidatePath(`/account/pets/${petId}/manage`);
  }
  return result;
}
