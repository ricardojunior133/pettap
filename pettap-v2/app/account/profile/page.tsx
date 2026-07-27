import Card from "@/components/ui/Card";
import { AccountPortalService } from "@/features/account/services/account-portal-service";

export default async function AccountProfilePage() {
  const profile = await new AccountPortalService().getProfile();

  return (
    <section aria-labelledby="profile-heading">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">Account settings</p>
      <h1 id="profile-heading" className="mt-3 text-4xl font-semibold tracking-[-0.06em]">Your profile</h1>
      <p className="mt-4 max-w-xl text-base leading-7 text-neutral-600">These details are visible only to you in your PetTap account.</p>
      <Card variant="surface" className="mt-8 divide-y divide-black/[0.07] overflow-hidden">
        <dl className="divide-y divide-black/[0.07]">
          <div className="grid gap-1 px-6 py-5 sm:grid-cols-[10rem_1fr] sm:gap-4"><dt className="text-sm font-medium text-neutral-600">Name</dt><dd className="font-semibold">{profile.displayName}</dd></div>
          <div className="grid gap-1 px-6 py-5 sm:grid-cols-[10rem_1fr] sm:gap-4"><dt className="text-sm font-medium text-neutral-600">Email</dt><dd className="font-semibold">{profile.email ?? "Not available"}</dd></div>
          <div className="grid gap-1 px-6 py-5 sm:grid-cols-[10rem_1fr] sm:gap-4"><dt className="text-sm font-medium text-neutral-600">Phone</dt><dd className="font-semibold">{profile.phone ?? "Not added"}</dd></div>
        </dl>
      </Card>
      <p className="mt-5 text-sm leading-6 text-neutral-600">Profile editing will become available after its compatible versioned foundation is reviewed.</p>
    </section>
  );
}
