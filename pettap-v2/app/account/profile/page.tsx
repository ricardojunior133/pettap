import { CustomerProfileSettings } from "@/features/account/components/customer-profile-settings";
import { AccountPortalService } from "@/features/account/services/account-portal-service";
import { CustomerAddressService } from "@/features/commerce/services/customer-address-service";

export default async function AccountProfilePage() {
  const [profile, addresses] = await Promise.all([new AccountPortalService().getProfile(), new CustomerAddressService().list()]);

  return (
    <section aria-labelledby="profile-heading">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">Account settings</p>
      <h1 id="profile-heading" className="mt-3 text-4xl font-semibold tracking-[-0.06em]">Your profile</h1>
      <p className="mt-4 max-w-xl text-base leading-7 text-neutral-600">These details are visible only to you in your PetTap account.</p>
      <CustomerProfileSettings profile={profile} addresses={addresses} />
    </section>
  );
}
