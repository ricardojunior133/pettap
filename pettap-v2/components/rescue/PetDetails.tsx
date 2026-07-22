import { Activity, BadgeCheck, House, Info, Scale, ScanLine, UserRound, type LucideIcon } from "lucide-react";

import type { RescuePet } from "@/src/lib/domain/rescue";

interface Detail {
  icon: LucideIcon;
  label: string;
  value: string;
}

export default function PetDetails({ pet }: { pet: RescuePet }) {
  const details: Detail[] = [
    { icon: UserRound, label: "Species", value: pet.species ?? "Pet" },
    { icon: UserRound, label: "Breed", value: pet.breed },
    { icon: Activity, label: "Age", value: pet.age },
    { icon: Info, label: "Colour", value: pet.colour },
    { icon: Scale, label: "Weight", value: pet.weight },
    { icon: ScanLine, label: "Microchip", value: pet.microchipNumber ?? (pet.microchip === "verified" ? "Verified" : "Not provided") },
    { icon: BadgeCheck, label: "Neutered", value: pet.neutered ? "Yes" : "No" },
    { icon: House, label: "Lifestyle", value: pet.lifestyle ?? "Not shared" },
  ];

  return (
    <section aria-labelledby="pet-information" className="mt-12">
      <h2 id="pet-information" className="text-2xl font-semibold tracking-tight text-foreground">Pet information</h2>
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {details.map(({ icon: Icon, label, value }) => (
          <div key={label} className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
            <Icon className="h-5 w-5 text-sky-700" strokeWidth={1.8} />
            <p className="mt-4 text-sm font-medium text-muted-foreground">{label}</p>
            <p className="mt-1 text-base font-semibold text-foreground">{value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
