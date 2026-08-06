"use client";

import Card from "@/components/ui/Card";
import { Divider } from "@/components/ui/Divider";
import { CircleDot, Gem, Palette, Ruler, Sparkles, Type, WandSparkles, type LucideIcon } from "lucide-react";
import { formatStudioPrice, generateStudioSku, getStudioPrice } from "@/lib/studio/commerce";
import { findStudioLabel, findStudioModel, studioCollections, studioColours, studioFinishes, studioLineColours, studioMaterials, studioSizes } from "@/lib/studio/options";

import { useStudio } from "./StudioContext";

export default function StudioSummary() {
  const { studio } = useStudio();
  const price = getStudioPrice(studio);
  const sku = generateStudioSku(studio) ?? "Pending selection";
  const details: Array<[string, string, LucideIcon]> = [
    ["Collection", findStudioLabel(studioCollections, studio.collection ?? "", "Essential"), Sparkles],
    ["Model", findStudioModel(studio.collection, studio.design)?.name ?? studio.design, Gem],
    ...(studio.collection === "seasonal" && studio.season ? ([ ["Season", studio.season, CircleDot] ] as Array<[string, string, LucideIcon]>) : []),
    ["Name", studio.petName || "Not added", Type],
    ["Primary", findStudioLabel(studioColours, studio.colour, studio.colour), Palette],
    ["Accent", findStudioLabel(studioLineColours, studio.lineColour, studio.lineColour), Palette],
    ["Size", findStudioLabel(studioSizes, studio.size, studio.size), Ruler],
    ["Material", findStudioLabel(studioMaterials, studio.material, studio.material), CircleDot],
    ["Finish", findStudioLabel(studioFinishes, studio.finish, studio.finish), WandSparkles],
    ["SKU", sku, Gem],
  ];

  return <Card variant="outlined" className="overflow-hidden border-black/[0.08] bg-white p-0 shadow-[0_16px_42px_rgba(17,17,17,0.05)]"><div className="bg-neutral-950 px-5 py-4 text-white sm:px-6"><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/55">Your configuration</p><h2 className="mt-1 text-xl font-semibold tracking-[-0.035em]">Your PetTap</h2></div><div className="p-5 sm:p-6"><dl className="space-y-3">{details.map(([label, value, Icon], index) => <div key={label}>{index ? <Divider className="mb-3" /> : null}<div className="flex items-center justify-between gap-4"><dt className="flex items-center gap-2 text-sm text-neutral-500"><Icon aria-hidden="true" className="size-3.5 text-neutral-400" />{label}</dt><dd className="max-w-[58%] truncate text-right text-sm font-semibold capitalize text-neutral-900">{value}</dd></div></div>)}</dl><div className="mt-5 flex flex-wrap gap-2"><span className="rounded-full border border-black/[0.08] bg-neutral-50 px-3 py-1 text-xs font-semibold text-neutral-700">{studio.material}</span><span className="rounded-full border border-black/[0.08] bg-neutral-50 px-3 py-1 text-xs font-semibold capitalize text-neutral-700">{studio.finish}</span></div><Divider className="my-5" /><div className="flex items-end justify-between gap-4"><span className="text-sm font-medium text-neutral-600">Total</span><strong className="text-3xl font-semibold tracking-[-0.05em] text-neutral-950">{formatStudioPrice(price)}</strong></div><p className="mt-2 text-xs leading-5 text-neutral-500">Final delivery and checkout details will be confirmed next.</p></div></Card>;
}
