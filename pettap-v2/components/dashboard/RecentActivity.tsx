import { ContactRound, ShieldCheck, Tag, UserRound } from "lucide-react";

import Card from "@/components/ui/Card";
import type { DashboardActivity } from "@/lib/dashboard";

const icons = { profile: UserRound, tag: Tag, contact: ContactRound, shield: ShieldCheck };

export default function RecentActivity({ activities }: { activities: DashboardActivity[] }) {
  return <section aria-labelledby="recent-activity"><div><p className="text-sm font-semibold uppercase tracking-[0.14em] text-sky-700">A little peace of mind</p><h2 id="recent-activity" className="mt-1 text-3xl font-semibold tracking-tight text-foreground">Recent activity</h2></div><Card className="mt-5 px-5 sm:px-6"><ol className="divide-y divide-neutral-100">{activities.map((activity) => { const Icon = icons[activity.icon]; return <li key={activity.title} className="flex gap-4 py-5 first:pt-5 last:pb-5"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-foreground"><Icon className="h-5 w-5" strokeWidth={1.8} /></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1"><h3 className="font-semibold text-foreground">{activity.title}</h3><time className="text-sm font-medium text-muted-foreground">{activity.timestamp}</time></div><p className="mt-1 text-sm leading-6 text-muted-foreground">{activity.detail}</p></div></li>; })}</ol></Card></section>;
}
