import { ContactRound, ImageIcon, PawPrint, ShieldCheck } from "lucide-react";

import Card from "@/components/ui/Card";
import type { WorkspaceActivity } from "@/lib/dashboard";

const icons = { pet: PawPrint, photo: ImageIcon, contact: ContactRound, shield: ShieldCheck };

export default function PetTimeline({ activity }: { activity: WorkspaceActivity[] }) {
  return <section aria-labelledby="pet-history"><div><p className="text-sm font-semibold uppercase tracking-[0.14em] text-sky-700">Recent moments</p><h2 id="pet-history" className="mt-1 text-3xl font-semibold tracking-tight text-foreground">Activity</h2></div><Card className="mt-5 px-5 sm:px-6"><ol className="divide-y divide-neutral-100">{activity.map((item) => { const Icon = icons[item.icon]; return <li key={`${item.title}-${item.timestamp}`} className="flex gap-4 py-5"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-foreground"><Icon className="h-5 w-5" strokeWidth={1.8} /></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1"><h3 className="font-semibold text-foreground">{item.title}</h3><time className="text-sm font-medium text-muted-foreground">{item.timestamp}</time></div><p className="mt-1 text-sm leading-6 text-muted-foreground">{item.detail}</p></div></li>; })}</ol></Card></section>;
}
