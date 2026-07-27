import Link from "next/link";

import Card from "@/components/ui/Card";
import { AccountPortalService } from "@/features/account/services/account-portal-service";

export default async function AccountPage() {
  const account = await new AccountPortalService().getOverview();

  return (
    <section aria-labelledby="account-heading">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">Your account</p>
      <h1 id="account-heading" className="mt-3 text-4xl font-semibold tracking-[-0.06em] sm:text-5xl">Welcome back, {account.firstName}.</h1>
      <p className="mt-4 max-w-xl text-base leading-7 text-neutral-600">A calm place to keep the details that matter to you and your pets close at hand.</p>

      <div className="mt-9 grid gap-4 sm:grid-cols-2">
        <Card variant="surface" className="p-6"><p className="text-sm font-medium text-neutral-600">Profile</p><p className="mt-3 text-xl font-semibold tracking-[-0.04em]">{account.profile.displayName}</p><p className="mt-2 text-sm text-neutral-600">Your contact details are kept private.</p><Link className="mt-5 inline-flex text-sm font-semibold underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950" href="/account/profile">View profile</Link></Card>
        <Card variant="outlined" className="p-6"><p className="text-sm font-medium text-neutral-600">Orders</p><p className="mt-3 text-xl font-semibold tracking-[-0.04em]">Order history</p><p className="mt-2 text-sm leading-6 text-neutral-600">Order history will appear here once the compatible commerce foundation is versioned.</p><Link className="mt-5 inline-flex text-sm font-semibold underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950" href="/account/orders">Learn more</Link></Card>
      </div>
    </section>
  );
}
