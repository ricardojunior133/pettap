"use client";

import Link from "next/link";
import Card from "@/components/ui/Card";
import { Check, Clock3, PackageCheck } from "lucide-react";
import { useStudio } from "@/components/studio/StudioContext";
import TagPreview from "@/components/studio/preview/TagPreview";
import { TAG_DESIGNS } from "@/lib/designs";
import { TAG_SIZES } from "@/lib/sizes";
import { FINISH_NAME_BY_VALUE } from "@/lib/finishes";
import { createCustomPurchase, createOrderDraft, saveOrderDraft } from "@/lib/checkout/draft";
import { getTagPrice } from "@/src/lib/domain/tag";

export default function SummaryCard() {
  const { studio } = useStudio();
  const design = TAG_DESIGNS.find((item) => item.id === studio.design)?.name ?? studio.design;
  const size = TAG_SIZES.find((item) => item.id === studio.size)?.title ?? studio.size;
  const price = getTagPrice(studio);
  const ready = Boolean(studio.petName.trim());

  function saveCustomDraft() { saveOrderDraft(createOrderDraft(createCustomPurchase(studio))); }

  const actionClass = "mt-6 flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-neutral-950 px-5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-neutral-950/15 disabled:cursor-not-allowed disabled:opacity-45";
  return <Card className="overflow-hidden rounded-[28px] border-black/[0.06] p-6 shadow-[0_16px_50px_rgba(17,17,17,0.04)] sm:p-8"><div className="flex items-start justify-between gap-4"><div><p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-400">Your configuration</p><h3 className="mt-2 text-xl font-semibold tracking-[-0.025em] text-neutral-950">Your PetTag</h3></div><PackageCheck className="mt-1 size-5 text-neutral-400" aria-hidden="true" /></div><div className="mt-6 flex justify-center rounded-2xl bg-neutral-50 p-6"><div className="w-44"><TagPreview {...studio} /></div></div><dl className="mt-6 grid grid-cols-2 gap-2.5"><Detail label="Shape" value={design} /><Detail label="Colour" value={FINISH_NAME_BY_VALUE[studio.colour] ?? studio.colour} /><Detail label="Size" value={size} /><Detail label="Material" value={studio.material} /><Detail label="Finish" value={studio.finish} /><Detail label="Pet name" value={studio.petName || "Not added"} /></dl>{!ready && <p className="mt-4 rounded-2xl border border-black/[0.06] bg-neutral-50 px-4 py-3 text-sm leading-5 text-neutral-600">Add their name to continue to review.</p>}<div className="my-7 h-px bg-black/[0.06]" /><div className="flex items-center justify-between"><span className="text-sm font-medium text-neutral-500">Total</span><span className="text-5xl font-semibold tracking-[-0.05em] text-neutral-950">£{price.toFixed(2)}</span></div><div className="mt-5 rounded-2xl border border-black/[0.06] bg-neutral-50 p-4 text-sm text-neutral-600"><p className="flex items-center gap-2 font-medium text-neutral-900"><Clock3 className="size-4" aria-hidden="true" />Made to order</p><p className="mt-2 text-xs leading-5">Delivery timing will be confirmed before payment is enabled.</p></div>{ready ? <Link href="/checkout/review" onClick={saveCustomDraft} className={actionClass}>Continue to review <Check className="size-4" aria-hidden="true" /></Link> : <button type="button" disabled className={actionClass}>Add a pet name to continue</button>}</Card>;
}

function Detail({ label, value }: { label: string; value: string }) { return <div className="rounded-2xl border border-black/[0.05] bg-neutral-50/70 px-3.5 py-3"><dt className="text-[10px] font-medium uppercase tracking-[0.14em] text-neutral-400">{label}</dt><dd className="mt-1 truncate text-sm font-medium text-neutral-900">{value}</dd></div>; }
