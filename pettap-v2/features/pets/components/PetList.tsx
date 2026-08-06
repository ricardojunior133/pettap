import { PawPrint } from "lucide-react";

import type { Pet } from "../types/pet";
import { PetCard } from "./PetCard";

export function PetList({ pets }: { pets: Pet[] }) {
  if (pets.length === 0) return <section className="mt-10 rounded-[28px] border border-dashed border-black/[0.12] bg-white p-8 text-center sm:p-12"><PawPrint className="mx-auto size-6 text-neutral-400" aria-hidden="true" /><h2 className="mt-4 text-xl font-semibold tracking-[-0.03em] text-neutral-950">No pets yet</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-600">Add your first pet to begin building their PetTap profile.</p></section>;

  return <section className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-label="Your pets">{pets.map((pet) => <PetCard key={pet.id} pet={pet} />)}</section>;
}
