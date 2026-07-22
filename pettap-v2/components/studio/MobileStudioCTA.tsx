"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { createCustomPurchase, createOrderDraft, saveOrderDraft } from "@/lib/checkout/draft";
import { useStudio } from "./StudioContext";

export default function MobileStudioCTA() {
  const { studio } = useStudio();
  const ready = Boolean(studio.petName.trim());
  const className = `fixed inset-x-4 bottom-4 z-40 flex min-h-14 items-center justify-center gap-2 rounded-2xl px-5 text-sm font-semibold shadow-[0_14px_32px_rgba(17,17,17,0.18)] backdrop-blur lg:hidden ${ready ? "bg-neutral-950 text-white" : "bg-white text-neutral-500 ring-1 ring-black/[0.08]"}`;
  if (!ready) return <button type="button" disabled className={className}>Add a pet name to continue</button>;
  return <Link href="/checkout/review" onClick={() => saveOrderDraft(createOrderDraft(createCustomPurchase(studio)))} className={className}>Continue to review <ArrowRight className="size-4" aria-hidden="true" /></Link>;
}
