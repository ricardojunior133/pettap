import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminNfcTagCreateForm } from "@/features/admin/nfc-tags/admin-nfc-tag-create-form";
import { AdminNfcTagService, type AdminNfcTagQuery } from "@/features/admin/nfc-tags/admin-nfc-tag-service";
import { AdminPermissionDeniedError } from "@/features/admin/services/admin-authorization-service";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "NFC tags", robots: { index: false, follow: false } };

function hrefFor(query: AdminNfcTagQuery, page: number) {
  const params = new URLSearchParams();
  if (query.publicCode) params.set("publicCode", query.publicCode);
  if (query.status) params.set("status", query.status);
  if (query.unassignedOnly) params.set("unassigned", "true");
  if (query.withoutPet) params.set("withoutPet", "true");
  if (page > 1) params.set("page", String(page));
  const suffix = params.toString();
  return suffix ? `/admin/tags?${suffix}` : "/admin/tags";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

async function loadNfcTags(searchParams: Promise<Record<string, string | string[] | undefined>>) {
  try {
    return await new AdminNfcTagService().list(await searchParams);
  } catch (error) {
    if (error instanceof AdminPermissionDeniedError) notFound();
    throw error;
  }
}

export default async function AdminNfcTagsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const page = await loadNfcTags(searchParams);
  const start = page.total ? (page.page - 1) * page.pageSize + 1 : 0;
  const end = page.total ? Math.min(page.page * page.pageSize, page.total) : 0;
  return <main className="mx-auto max-w-6xl px-6 py-10"><header><p className="text-xs font-semibold uppercase tracking-[.18em] text-neutral-500">Private operations</p><h1 className="mt-3 text-3xl font-semibold tracking-[-.05em] sm:text-5xl">NFC tags</h1><p className="mt-3 max-w-2xl text-neutral-600">Read-only operational lookup for canonical PetTap tags. Credentials and customer contact details are never displayed.</p></header>
      <AdminNfcTagCreateForm />
      <form action="/admin/tags" className="mt-6 grid gap-4 rounded-3xl border border-black/[.07] bg-white p-5 md:grid-cols-4">
        <label className="text-sm font-medium">Public Code<input className="mt-1 min-h-11 w-full rounded-xl border border-black/[.1] px-3" defaultValue={page.query.publicCode} maxLength={128} name="publicCode" pattern="[A-Za-z0-9_-]*" /></label>
        <label className="text-sm font-medium">Status<select className="mt-1 min-h-11 w-full rounded-xl border border-black/[.1] bg-white px-3" defaultValue={page.query.status ?? ""} name="status"><option value="">All statuses</option><option value="unassigned">Unassigned</option><option value="active">Active</option><option value="suspended">Suspended</option><option value="lost">Lost</option><option value="retired">Retired</option></select></label>
        <label className="flex min-h-11 items-center gap-2 self-end text-sm font-medium"><input defaultChecked={page.query.unassignedOnly} name="unassigned" type="checkbox" value="true" />Unassigned only</label>
        <label className="flex min-h-11 items-center gap-2 self-end text-sm font-medium"><input defaultChecked={page.query.withoutPet} name="withoutPet" type="checkbox" value="true" />Without pet linked</label>
        <div className="flex gap-3 md:col-span-4"><button className="min-h-11 rounded-xl bg-neutral-950 px-5 text-sm font-semibold text-white">Apply filters</button><Link className="inline-flex min-h-11 items-center rounded-xl px-4 text-sm font-semibold text-neutral-700" href="/admin/tags">Clear filters</Link></div>
      </form>
      <section className="mt-6 overflow-hidden rounded-3xl border border-black/[.07] bg-white"><div className="border-b border-black/[.06] px-5 py-4 text-sm text-neutral-600">{page.total ? `Showing ${start}–${end} of ${page.total}` : "Showing 0 of 0"}</div>{page.tags.length ? <ul>{page.tags.map((tag) => <li className="grid gap-3 border-b border-black/[.06] px-5 py-5 last:border-0 md:grid-cols-[1.2fr_.7fr_1fr_1fr]" key={tag.publicCode}><div><p className="font-mono text-sm font-semibold">{tag.publicCode}</p><p className="mt-1 text-sm text-neutral-600">{tag.accountReference}</p></div><p className="capitalize text-sm font-medium">{tag.status}</p><p className="text-sm text-neutral-700">{tag.petName ? `Pet: ${tag.petName}` : "No pet linked"}</p><p className="text-sm text-neutral-500">Updated {formatDate(tag.updatedAt)}</p></li>)}</ul> : <p className="px-5 py-12 text-center text-sm text-neutral-600">No NFC tags match these filters.</p>}</section>
      <nav aria-label="NFC tag pagination" className="mt-5 flex items-center justify-between gap-3"><Link aria-disabled={page.page <= 1 || page.total === 0} className="min-h-11 rounded-xl px-3 py-2 text-sm font-semibold aria-disabled:pointer-events-none aria-disabled:opacity-40" href={hrefFor(page.query, Math.max(1, page.page - 1))}>Previous</Link>{page.total ? <p className="text-sm text-neutral-600">Page {page.page} of {page.totalPages}</p> : null}<Link aria-disabled={page.total === 0 || page.page >= page.totalPages} className="min-h-11 rounded-xl px-3 py-2 text-sm font-semibold aria-disabled:pointer-events-none aria-disabled:opacity-40" href={hrefFor(page.query, Math.min(Math.max(1, page.totalPages), page.page + 1))}>Next</Link></nav>
    </main>;
}
