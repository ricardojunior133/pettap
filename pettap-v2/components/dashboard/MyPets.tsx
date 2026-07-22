import type { DashboardPet } from "@/lib/dashboard";

import PetCard from "./PetCard";

export default function MyPets({ pets }: { pets: DashboardPet[] }) {
  return <section aria-labelledby="my-pets"><div className="flex items-end justify-between gap-4"><div><p className="text-sm font-semibold uppercase tracking-[0.14em] text-sky-700">Your family</p><h2 id="my-pets" className="mt-1 text-3xl font-semibold tracking-tight text-foreground">My pets</h2></div><span className="text-sm font-medium text-muted-foreground">{pets.length} protected</span></div><div className="mt-5 grid gap-5 sm:grid-cols-2">{pets.map((pet) => <PetCard key={pet.id} pet={pet} />)}</div></section>;
}
