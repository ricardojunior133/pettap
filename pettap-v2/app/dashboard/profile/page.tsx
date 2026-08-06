import { CustomerProfile } from "@/components/dashboard/CustomerProfile";
import { CustomerProfileService } from "@/features/owner/services/customer-profile-service";

export default async function DashboardProfilePage() {
  const profile = await new CustomerProfileService().getProfile();
  return <CustomerProfile profile={profile} />;
}
