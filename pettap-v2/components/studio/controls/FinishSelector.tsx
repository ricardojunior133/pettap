"use client";

import { Sparkles } from "lucide-react";
import { useStudio } from "../StudioContext";

const finishes = [{ id: "matte" as const, title: "Matte", description: "Soft, understated and made for everyday wear." }, { id: "gloss" as const, title: "Gloss", description: "A smoother light-catching finish for a more expressive look." }];

export default function FinishSelector() {
  const { studio, updateStudio } = useStudio();
  return <div className="grid gap-3 sm:grid-cols-2">{finishes.map((finish) => { const active = studio.finish === finish.id; return <button key={finish.id} type="button" onClick={() => updateStudio({ finish: finish.id })} aria-pressed={active} className={`rounded-2xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/25 ${active ? "border-black bg-neutral-950 text-white shadow-lg" : "border-black/[0.08] bg-white hover:-translate-y-0.5 hover:border-black/25"}`}><span className="flex items-center gap-2"><Sparkles className={`size-4 ${active ? "text-white/70" : "text-neutral-500"}`} aria-hidden="true" /><span className="font-semibold">{finish.title}</span></span><span className={`mt-2 block text-sm leading-6 ${active ? "text-white/65" : "text-neutral-500"}`}>{finish.description}</span></button>; })}</div>;
}
