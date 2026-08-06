import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminTagTimeline } from "@/features/admin/activity/components/admin-timeline";
import { AdminTagActionPanel } from "@/features/admin/tags/components/admin-tag-action-panel";
import { AdminTagNotFoundError, AdminTagService } from "@/features/admin/tags/services/admin-tag-service";
import { requireAdminPermission } from "@/lib/auth/require-admin";

async function loadTag(tagId: string) {
  try {
    const [tag, context] = await Promise.all([new AdminTagService().get(tagId), requireAdminPermission("tags.read")]);
    return { tag, context };
  } catch (error) {
    if (error instanceof AdminTagNotFoundError) notFound();
    throw error;
  }
}

export default async function AdminTagDetailPage({ params }: { params: Promise<{ tagId: string }> }) {
  const { tagId } = await params;
  const { tag, context } = await loadTag(tagId);
  return (
    <>
      <Link className="text-sm font-semibold text-neutral-600 underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950" href={tag.accountId ? `/admin/customers/${tag.accountId}` : "/admin/customers"}>
        Back to customer
      </Link>
      <header className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">NFC tag</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.05em] sm:text-5xl">{tag.publicId}</h1>
        <p className="mt-3 capitalize text-neutral-600">{tag.status}</p>
      </header>

      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        <Card label="Associated pet" value={tag.petName ?? "Not assigned"} />
        <Card label="Owner" value={tag.ownerName ?? "Not assigned"} />
        <Card label="Activation" value={tag.activatedAt ? new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(new Date(tag.activatedAt)) : "Not activated"} />
      </section>

      {tag.status === "suspended" ? <section className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-950"><p className="font-semibold">Temporarily unavailable</p><p className="mt-1">The public rescue resolver must not disclose a normal profile for this tag once connected to production data.</p></section> : null}

      <section className="mt-10 grid gap-4 lg:grid-cols-2">
        <article className="rounded-[24px] border border-black/[0.07] bg-white p-6">
          <h2 className="text-lg font-semibold">Operational status</h2>
          <dl className="mt-5 space-y-3 text-sm">
            <Row label="Public ID" value={tag.publicId} />
            <Row label="Status" value={tag.status} />
            <Row label="Suspended" value={tag.suspendedAt ? new Date(tag.suspendedAt).toLocaleString("en-GB") : "No"} />
            <Row label="Suspension reason" value={tag.suspensionReasonCode ?? "Not applicable"} />
          </dl>
          <p className="mt-6 text-xs leading-5 text-neutral-500">Activation codes, hashes, service credentials and private activation secrets are never returned to this page.</p>
        </article>
        <AdminTagActionPanel canReactivate={context.permissions.includes("tags.reactivate")} canSuspend={context.permissions.includes("tags.suspend")} status={tag.status} tagId={tag.id} />
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold tracking-[-0.03em]">Recent activity</h2>
        <div className="mt-4"><AdminTagTimeline tagId={tag.id} /></div>
      </section>
    </>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return <article className="rounded-2xl border border-black/[0.07] bg-white p-5"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">{label}</p><p className="mt-2 text-lg font-semibold">{value}</p></article>;
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex items-start justify-between gap-4"><dt className="text-neutral-500">{label}</dt><dd className="text-right font-medium capitalize">{value}</dd></div>;
}
