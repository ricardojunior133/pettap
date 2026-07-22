import type { PetWorkspace } from "@/lib/dashboard";

import PetSummary from "./PetSummary";
import PetTagCard from "./PetTagCard";
import PetTimeline from "./PetTimeline";

export default function OverviewTab({ pet, lostMode }: { pet: PetWorkspace; lostMode?: boolean }) {
  return <div className="space-y-14"><PetSummary pet={pet} /><PetTagCard pet={pet} lostMode={lostMode} /><PetTimeline activity={pet.activity} /></div>;
}
