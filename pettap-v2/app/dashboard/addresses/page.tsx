import { CustomerAddresses } from "@/components/dashboard/CustomerAddresses";
import { CustomerAddressService } from "@/features/commerce/services/customer-address-service";

export default async function AddressesPage() {
  const addresses = await new CustomerAddressService().list();

  return <CustomerAddresses addresses={addresses} />;
}
