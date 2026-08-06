import type { Metadata } from "next";

import { EmptyState, PageHeader } from "@/components/app/AppShell";
import { getCurrentUser } from "@/lib/backend/auth/get-current-user";
import { ensureAccountProfile } from "@/features/owner/services/profile-service";
import { createPetService } from "@/features/pets/services/pet-service";
import { TagService } from "@/features/tags/services/tag-service";
import { LostReportService } from "@/features/lost-mode/services/lost-report-service";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Owner dashboard",
  description: "Your PetTap home for managing the pets you love.",
  robots: { index: false, follow: false },
};

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) return null;

  const profile = await ensureAccountProfile({
    authUserId: user.id,
    email: user.email,
    userMetadata: user.user_metadata,
  });
  const [petCount, tags, activeLostReports] = await Promise.all([createPetService().countPets(), new TagService().list(), new LostReportService().listActive()]);
  const activeTagCount = tags.filter((tag) => tag.status === "active").length;

  return (
    <>
      <PageHeader
        eyebrow="Your PetTap account"
        title={`Welcome, ${profile.displayName}`}
        description="Manage your pets, tags and safety information from one private place."
      />
      <section className="mt-10 rounded-[28px] border border-black/[0.07] bg-white p-6 shadow-[0_12px_36px_rgba(0,0,0,0.04)] sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">Signed in as</p>
        <p className="mt-3 text-lg font-medium tracking-[-0.02em] text-neutral-950">{user.email}</p>
      </section>
      {activeLostReports.length ? <section className="mt-5 rounded-[28px] border border-amber-200 bg-amber-50 p-6 text-amber-950"><p className="text-sm font-semibold">Lost Mode needs attention</p><p className="mt-1 text-sm">{activeLostReports.length} pet{activeLostReports.length === 1 ? " is" : "s are"} currently marked as lost.</p><Link className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-neutral-950 px-4 text-sm font-semibold text-white" href="/dashboard/pets">Manage alerts</Link></section> : null}
      <section className="mt-5 grid gap-4 sm:grid-cols-3"><Metric label="My Pets" value={petCount} detail={petCount === 1 ? "pet in your account" : "pets in your account"} href="/dashboard/pets" /><Metric label="Active tags" value={activeTagCount} detail={activeTagCount === 1 ? "tag protecting a pet" : "tags protecting pets"} href="/dashboard/tags" /><Metric label="Unassigned tags" value={tags.filter((tag) => tag.status === "unassigned").length} detail="ready to activate" href="/dashboard/tags/activate" /></section>
      {petCount === 0 ? <EmptyState title="Your PetTap is ready" description="Add your first pet to begin creating their private profile." /> : null}
    </>
  );
}

function Metric({ label, value, detail, href }: { label: string; value: number; detail: string; href: string }) { return <section className="rounded-[28px] border border-black/[0.07] bg-white p-6 shadow-[0_12px_36px_rgba(0,0,0,0.04)]"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">{label}</p><p className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-neutral-950">{value}</p><p className="mt-1 text-sm leading-6 text-neutral-600">{detail}</p><Link className="mt-4 inline-block text-sm font-semibold text-neutral-950 underline" href={href}>View details</Link></section>; }
