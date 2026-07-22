import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, Eye, ShieldAlert } from "lucide-react";

import Card from "@/components/ui/Card";
import type { DashboardPet } from "@/lib/dashboard";

export default function PetCard({ pet }: { pet: DashboardPet }) {
  return <Card className="group overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(0,0,0,.10)]"><div className="relative aspect-[16/10] overflow-hidden bg-neutral-100"><Image src={pet.photo} alt={pet.name} fill sizes="(max-width: 640px) 100vw, 50vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" /></div><div className="p-5"><div className="flex items-start justify-between gap-3"><div><h3 className="text-xl font-semibold tracking-tight text-foreground">{pet.name}</h3><p className="mt-1 text-sm text-muted-foreground">{pet.breed} · {pet.age}</p></div><span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800"><CheckCircle2 className="h-3.5 w-3.5" />Tag active</span></div><div className="mt-5 flex items-center justify-between border-t border-neutral-100 pt-4"><span className={`inline-flex items-center gap-1.5 text-sm font-medium ${pet.lostMode ? "text-rose-700" : "text-emerald-700"}`}>{pet.lostMode ? <ShieldAlert className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}{pet.lostMode ? "Lost Mode active" : "Protected"}</span><Link href={`/dashboard/pets/${pet.id}`} className="inline-flex min-h-10 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-foreground transition-colors hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"><Eye className="h-4 w-4" />View details</Link></div></div></Card>;
}
