"use client";

import { Layers } from "lucide-react";
import { useStudio } from "../StudioContext";

const materials = [{ id: "PETG" as const, name: "PETG", description: "A premium, lightweight polymer selected for everyday pet life.", note: "More materials will appear here as the collection evolves." }];

export default function MaterialSelector() {
  const { studio, updateStudio } = useStudio();
  return <div className="space-y-3">{materials.map((material) => { const active = studio.material === material.id; return <button key={material.id} type="button" onClick={() => updateStudio({ material: material.id })} aria-pressed={active} className={`flex w-full items-start gap-4 rounded-2xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/25 ${active ? "border-black bg-neutral-950 text-white shadow-lg" : "border-black/[0.08] bg-white hover:border-black/25"}`}><span className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${active ? "bg-white/10" : "bg-neutral-100 text-neutral-700"}`}><Layers className="size-5" aria-hidden="true" /></span><span><span className="block font-semibold">{material.name}</span><span className={`mt-1 block text-sm leading-6 ${active ? "text-white/65" : "text-neutral-500"}`}>{material.description}</span><span className={`mt-2 block text-xs ${active ? "text-white/45" : "text-neutral-400"}`}>{material.note}</span></span></button>; })}</div>;
}
