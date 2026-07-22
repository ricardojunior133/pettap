import { CheckCircle2, Palette, ScanLine, Shapes, ShieldCheck, Tag } from "lucide-react";

import Card from "@/components/ui/Card";
import type { PetWorkspace } from "@/lib/dashboard";

export default function PetTagCard({ pet, lostMode = pet.lostMode }: { pet: PetWorkspace; lostMode?: boolean }) {
  const details = [
    { label: "Tag ID", value: pet.tagId, icon: Tag },
    { label: "NFC status", value: pet.nfcStatus === "inactive" ? "Inactive" : "Ready to tap", icon: ScanLine },
    { label: "Shape & size", value: `${pet.tagShape ?? "Round"} · ${pet.tagSize ?? "Classic"}`, icon: Shapes },
    { label: "Finish", value: pet.tagColour ?? "Midnight", icon: Palette },
    { label: "Material", value: pet.tagMaterial ?? "Matte PETG", icon: Tag },
    { label: "Activation date", value: pet.activationDate, icon: CheckCircle2 },
    { label: "Protection status", value: lostMode ? "Missing — emergency mode active" : pet.protectionStatus, icon: ShieldCheck },
    { label: "Last updated", value: lostMode ? "Just now" : pet.lastUpdated, icon: CheckCircle2 },
  ];

  return <section aria-labelledby="pettag-status"><div><p className="text-sm font-semibold uppercase tracking-[0.14em] text-sky-700">PetTap</p><h2 id="pettag-status" className="mt-1 text-3xl font-semibold tracking-tight text-foreground">Tag protection</h2></div><Card className="mt-5 p-5 sm:p-6"><div className="grid gap-4 sm:grid-cols-2">{details.map(({ label, value, icon: Icon }) => <div key={label} className="flex gap-3 rounded-2xl bg-neutral-50 p-4"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-sky-700 shadow-sm"><Icon className="h-5 w-5" strokeWidth={1.8} /></div><div><p className="text-sm font-medium text-muted-foreground">{label}</p><p className="mt-1 font-semibold text-foreground">{value}</p></div></div>)}</div><div className={`mt-5 flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium ${lostMode ? "bg-rose-50 text-rose-800" : "bg-emerald-50 text-emerald-800"}`}><ShieldCheck className="h-5 w-5" />{lostMode ? `Lost Mode is active. ${pet.name} is marked as missing.` : "Lost Mode is currently off. Your pet is protected."}</div></Card></section>;
}
