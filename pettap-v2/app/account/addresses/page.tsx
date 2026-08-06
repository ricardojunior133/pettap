import { CustomerAddresses } from "@/components/dashboard/CustomerAddresses";
import { CustomerAddressService } from "@/features/commerce/services/customer-address-service";
export default async function AccountAddressesPage() { return <CustomerAddresses addresses={await new CustomerAddressService().list()} />; }
