"use server";

import { revalidatePath } from "next/cache";

import { addressInputSchema } from "@/features/commerce/schemas/address";
import { CustomerAddressService } from "@/features/commerce/services/customer-address-service";

function readAddress(formData: FormData) {
  return { type: formData.get("type"), fullName: formData.get("fullName"), company: formData.get("company"), addressLine1: formData.get("addressLine1"), addressLine2: formData.get("addressLine2"), city: formData.get("city"), county: formData.get("county"), postcode: formData.get("postcode"), countryCode: formData.get("countryCode"), phone: formData.get("phone"), isDefault: formData.get("isDefault") === "on" };
}

export async function listCustomerAddresses() { return new CustomerAddressService().list(); }
export async function saveCustomerAddress(formData: FormData) {
  const input = addressInputSchema.parse(readAddress(formData));
  const id = formData.get("id");
  const service = new CustomerAddressService();
  const address = typeof id === "string" && id ? await service.update(id, input) : await service.create(input);
  revalidatePath("/account/profile");
  return address;
}
export async function deleteCustomerAddress(id: string) { await new CustomerAddressService().delete(id); revalidatePath("/account/profile"); }
export async function setDefaultAddress(id: string) { const address = await new CustomerAddressService().setDefault(id); revalidatePath("/account/profile"); return address; }
