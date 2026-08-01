"use server";

import { revalidatePath } from "next/cache";

import { customerPetTagLinkSchema, customerPetTagPublicIdentifierSchema } from "../schemas/customer-pet-tag-link";
import { CustomerPetTagLinkService } from "../services/customer-pet-tag-link-service";

const service = new CustomerPetTagLinkService();

export async function linkCustomerPetTag(petPublicIdentifier: string, form: FormData) {
  const petId = customerPetTagPublicIdentifierSchema.parse(petPublicIdentifier);
  const input = customerPetTagLinkSchema.parse({ publicCode: form.get("publicCode") });
  const result = await service.link(petId, input);
  if (result.ok) {
    revalidatePath("/account");
    revalidatePath("/account/pets");
    revalidatePath(`/account/pets/${petId}/manage`);
  }
  return result;
}
