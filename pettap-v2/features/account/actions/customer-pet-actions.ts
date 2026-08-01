"use server";
import { revalidatePath } from "next/cache";
import { customerPetInputSchema, petPublicIdentifierSchema } from "../schemas/customer-pet";
import { CustomerPetManagementService } from "../services/customer-pet-management-service";
const service=new CustomerPetManagementService();
const data=(form:FormData)=>({name:form.get("name"),species:form.get("species"),breed:form.get("breed"),birthDate:form.get("birthDate"),sex:form.get("sex")||undefined,weight:form.get("weight"),colour:form.get("colour")});
function refresh(){revalidatePath("/account");revalidatePath("/account/pets");}
export async function createCustomerPet(form:FormData){const parsed=customerPetInputSchema.parse(data(form));const pet=await service.create(parsed);const file=form.get("photo");if(file instanceof File&&file.size>0)await service.uploadPhoto(pet.publicIdentifier,file);refresh();return pet;}
export async function updateCustomerPet(publicIdentifier:string,form:FormData){const id=petPublicIdentifierSchema.parse(publicIdentifier);const parsed=customerPetInputSchema.parse(data(form));const pet=await service.update(id,parsed);if(!pet)throw new Error("Pet not found.");const file=form.get("photo");if(file instanceof File&&file.size>0)await service.uploadPhoto(id,file);refresh();return pet;}
export async function deleteCustomerPet(publicIdentifier:string){const id=petPublicIdentifierSchema.parse(publicIdentifier);const pet=await service.remove(id);if(!pet)throw new Error("Pet not found.");refresh();}
