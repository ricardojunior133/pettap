import { CheckCircle2, Palette, ScanLine, Shapes, Tag, type LucideIcon } from "lucide-react";
import Card from "@/components/ui/Card";
import type { RescueTag } from "@/types/rescue";

function Detail({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return <div className="flex gap-3 rounded-2xl bg-neutral-50 p-3.5"><Icon className="mt-0.5 h-4 w-4 shrink-0 text-sky-700" strokeWidth={1.8} /><div><p className="text-xs font-medium text-muted-foreground">{label}</p><p className="mt-1 text-sm font-semibold text-foreground">{value}</p></div></div>;
}

export default function TagDetails({ tag }: { tag: RescueTag }) {
  return <section aria-labelledby="tag-details" className="mt-12"><div><p className="text-sm font-semibold uppercase tracking-[0.14em] text-sky-700">PetTap</p><h2 id="tag-details" className="mt-1 text-2xl font-semibold tracking-tight text-foreground">Tag details</h2></div><Card className="mt-5 p-4 sm:p-5"><div className="grid gap-3 sm:grid-cols-2"><Detail icon={Tag} label="Tag ID" value={tag.id} /><Detail icon={CheckCircle2} label="NFC status" value={tag.nfcStatus === "ready" ? "Ready to tap" : "Inactive"} /><Detail icon={Shapes} label="Shape & size" value={`${tag.shape ?? "PetTag"} · ${tag.size ?? "Classic"}`} /><Detail icon={Palette} label="Finish" value={tag.colour ?? "Midnight"} /><Detail icon={ScanLine} label="Material" value={tag.material ?? "Matte PETG"} /><Detail icon={Tag} label="Activated" value={tag.activationDate ?? "Not activated"} /></div></Card></section>;
}
