import Image from "next/image";
import { CalendarDays, Palette, Scale, ScanLine, UserRound } from "lucide-react";

import Card from "@/components/ui/Card";
import type { PetWorkspace } from "@/lib/dashboard";

const summaryIcons = { sex: UserRound, colour: Palette, weight: Scale, birth: CalendarDays, microchip: ScanLine };

export default function PetSummary({ pet }: { pet: PetWorkspace }) {
  const details = [{ label: "Sex", value: pet.sex, icon: summaryIcons.sex }, { label: "Colour", value: pet.colour, icon: summaryIcons.colour }, { label: "Weight", value: pet.weight, icon: summaryIcons.weight }, { label: "Date of birth", value: pet.birthDate, icon: summaryIcons.birth }, { label: "Microchip", value: pet.microchip === "verified" ? "Verified" : "Not provided", icon: summaryIcons.microchip }];
  return <section aria-labelledby="pet-overview"><div className="flex items-end justify-between gap-4"><div><p className="text-sm font-semibold uppercase tracking-[0.14em] text-sky-700">Overview</p><h2 id="pet-overview" className="mt-1 text-3xl font-semibold tracking-tight text-foreground">{pet.name}, at a glance</h2></div></div><Card className="mt-5 overflow-hidden"><div className="grid lg:grid-cols-[.9fr_1.1fr]"><div className="relative min-h-72 bg-neutral-100"><Image src={pet.photo} alt={pet.name} fill sizes="(max-width: 1024px) 100vw, 40vw" className="object-cover" /></div><div className="p-6 sm:p-8"><p className="text-lg font-semibold text-foreground">A familiar face, always protected.</p><p className="mt-2 max-w-md leading-6 text-muted-foreground">Keep the information that helps {pet.name} get home safely close and clear.</p><dl className="mt-8 grid grid-cols-2 gap-x-4 gap-y-6">{details.map(({ label, value, icon: Icon }) => <div key={label}><Icon className="h-5 w-5 text-sky-700" strokeWidth={1.8} /><dt className="mt-3 text-sm font-medium text-muted-foreground">{label}</dt><dd className="mt-1 font-semibold text-foreground">{value}</dd></div>)}</dl></div></div></Card></section>;
}
