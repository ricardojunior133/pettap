import type { Metadata } from "next";
import Link from "next/link";

import {
  closeContactRequestAction,
  expireContactRequestAction,
  markContactRequestDeliveredAction,
} from "@/features/contact-requests/actions/contact-request-inbox-actions";
import { OwnerContactRequestCard } from "@/features/contact-requests/components/owner-contact-request-card";
import { ContactRequestInboxService } from "@/features/contact-requests/services/contact-request-inbox-service";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const metadata: Metadata = { title: "Finder contact requests | PetTap", robots: { index: false, follow: false } };

function pageFrom(value: string | undefined) { const parsed = Number(value); return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : 1; }

export default async function ContactRequestsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: pageValue } = await searchParams;
  const inbox = await new ContactRequestInboxService().list({ page: pageFrom(pageValue) });
  return <section aria-labelledby="contact-requests-heading">
    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">Private inbox</p>
    <div className="mt-3 flex flex-wrap items-end justify-between gap-4"><div><h1 id="contact-requests-heading" className="text-4xl font-semibold tracking-[-0.06em] sm:text-5xl">Finder contact requests</h1><p className="mt-3 max-w-2xl text-base leading-7 text-neutral-600">Messages about your pets stay private between you and the person who found them.</p></div><p className="rounded-full bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900" aria-label={`${inbox.pendingCount} pending contact requests`}>{inbox.pendingCount} pending</p></div>
    {inbox.items.length === 0 ? <div className="mt-8 rounded-3xl border border-dashed border-neutral-300 bg-white p-8 text-center"><h2 className="text-lg font-semibold">No contact requests yet</h2><p className="mt-2 text-sm leading-6 text-neutral-600">When someone sends a message about a pet in Lost Mode, it will appear here.</p></div> : <ol className="mt-8 space-y-4">{inbox.items.map(({ privateId, request }) => <li key={request.publicIdentifier}><OwnerContactRequestCard request={request} markDeliveredAction={markContactRequestDeliveredAction.bind(null, privateId)} closeAction={closeContactRequestAction.bind(null, privateId)} expireAction={expireContactRequestAction.bind(null, privateId)} /></li>)}</ol>}
    {inbox.total > 0 ? <nav className="mt-8 flex items-center justify-between gap-4" aria-label="Contact request pagination"><p className="text-sm text-neutral-600">Page {inbox.page} of {inbox.totalPages}</p>{inbox.page < inbox.totalPages ? <Link href={`/account/contact-requests?page=${inbox.page + 1}`} className="inline-flex min-h-11 items-center rounded-xl border border-neutral-300 px-4 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2">Next page</Link> : <span />}</nav> : null}
  </section>;
}
