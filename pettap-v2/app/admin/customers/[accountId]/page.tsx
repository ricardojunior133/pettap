import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminAccountTimeline } from "@/features/admin/activity/components/admin-timeline";
import {
  AdminCustomerNotFoundError,
  AdminCustomerService,
} from "@/features/admin/customers/services/admin-customer-service";
import { AdminPetService } from "@/features/admin/pets/services/admin-pet-service";
import { AdminTagService } from "@/features/admin/tags/services/admin-tag-service";

async function loadCustomer(accountId: string) {
  try {
    const customer = await new AdminCustomerService().getDetail(accountId);
    const [pets, tags] = await Promise.all([
      new AdminPetService().listForAccount(accountId),
      new AdminTagService().listForAccount(accountId),
    ]);
    return { customer, pets, tags };
  } catch (error) {
    if (error instanceof AdminCustomerNotFoundError) notFound();
    throw error;
  }
}

export default async function AdminCustomerDetailPage({
  params,
}: {
  params: Promise<{ accountId: string }>;
}) {
  const { accountId } = await params;
  const { customer, pets, tags } = await loadCustomer(accountId);

  return (
    <>
      <Link className="text-sm font-semibold text-neutral-600 underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950" href="/admin/customers">
        Back to customers
      </Link>
      <header className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">Account overview</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.05em] sm:text-5xl">{customer.displayName}</h1>
        <p className="mt-3 text-sm text-neutral-600">
          {customer.email ?? "Email unavailable"}
          {customer.emailMismatchDetected ? " · Account email mismatch detected" : ""}
        </p>
      </header>

      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        <Metric label="Pets" value={customer.petCount} />
        <Metric label="NFC tags" value={customer.tagCount} />
        <Metric label="Account created" value={new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(new Date(customer.createdAt))} />
      </section>

      <Section title="Pets">
        <div className="grid gap-3 sm:grid-cols-2">
          {pets.length ? pets.map((pet) => (
            <Link key={pet.id} className="rounded-2xl border border-black/[0.07] bg-white p-5 transition hover:border-black/[0.16] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950" href={`/admin/pets/${pet.id}`}>
              <p className="font-semibold">{pet.name}</p>
              <p className="mt-1 text-sm text-neutral-600">{pet.species} · {pet.tagCount} tags · Lost Mode {pet.lostModeActive ? "active" : "off"}</p>
            </Link>
          )) : <Empty message="This customer has no pets." />}
        </div>
      </Section>

      <Section title="NFC tags">
        <div className="grid gap-3 sm:grid-cols-2">
          {tags.length ? tags.map((tag) => (
            <Link key={tag.id} className="rounded-2xl border border-black/[0.07] bg-white p-5 transition hover:border-black/[0.16] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950" href={`/admin/tags/${tag.id}`}>
              <p className="font-semibold">{tag.publicId}</p>
              <p className="mt-1 text-sm capitalize text-neutral-600">{tag.status}{tag.petName ? ` · ${tag.petName}` : ""}</p>
            </Link>
          )) : <Empty message="No NFC tags are associated with this account." />}
        </div>
      </Section>

      <Section title="Recent activity">
        <AdminAccountTimeline accountId={accountId} />
      </Section>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="mt-10"><h2 className="text-xl font-semibold tracking-[-0.03em]">{title}</h2><div className="mt-4">{children}</div></section>;
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return <article className="rounded-2xl border border-black/[0.07] bg-white p-5"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">{label}</p><p className="mt-2 text-xl font-semibold">{value}</p></article>;
}

function Empty({ message }: { message: string }) {
  return <p className="rounded-2xl border border-dashed border-black/[0.12] bg-white p-6 text-sm text-neutral-600">{message}</p>;
}
