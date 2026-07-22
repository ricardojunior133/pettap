import { CheckCircle2, MessageCircle, Radio, ShieldAlert } from "lucide-react";

import Card from "@/components/ui/Card";
import type { EmergencyEvent, TimelineEvent } from "@/lib/lost-mode";

const icons: Record<EmergencyEvent, typeof ShieldAlert> = { "lost-mode-enabled": ShieldAlert, "pettap-scanned": Radio, "owner-contacted": MessageCircle, "pet-reunited": CheckCircle2 };

export default function EmergencyTimeline({ events }: { events: TimelineEvent[] }) {
  return <section aria-labelledby="emergency-timeline"><div><p className="text-sm font-semibold uppercase tracking-[.14em] text-rose-700">Emergency activity</p><h2 id="emergency-timeline" className="mt-1 text-3xl font-semibold tracking-tight text-foreground">Lost Mode timeline</h2></div><Card className="mt-5 px-5 sm:px-6"><ol className="divide-y divide-neutral-100">{events.map((event) => { const Icon = icons[event.event]; return <li key={event.id} className="flex gap-4 py-5"><div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${event.event === "lost-mode-enabled" ? "bg-rose-50 text-rose-700" : "bg-neutral-100 text-muted-foreground"}`}><Icon className="h-5 w-5" strokeWidth={1.8} /></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1"><h3 className="font-semibold text-foreground">{event.title}</h3><time className="text-sm font-medium text-muted-foreground">{event.timestamp}</time></div><p className="mt-1 text-sm leading-6 text-muted-foreground">{event.detail}</p></div></li>; })}</ol></Card></section>;
}
