import { AlertTriangle, CalendarDays, Clock3, Gift, MapPin, type LucideIcon } from "lucide-react";

import Card from "@/components/ui/Card";
import type { RescueProfile } from "@/src/lib/domain/rescue";

function Detail({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return <div className="flex items-center gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-rose-700 shadow-sm"><Icon className="h-5 w-5" strokeWidth={1.8} /></div><div><p className="text-sm font-medium text-muted-foreground">{label}</p><p className="mt-0.5 font-semibold text-foreground">{value}</p></div></div>;
}

export default function LostModeDetails({ profile }: { profile: RescueProfile }) {
  const hasLastSeen = profile.lastSeenLocation || profile.lastSeenDate || profile.lastSeenTime;
  return <div className="space-y-8 pt-8">
    {hasLastSeen && <section aria-labelledby="last-seen"><h2 id="last-seen" className="text-2xl font-semibold tracking-tight text-foreground">Last seen</h2><Card className="mt-4 overflow-hidden border-rose-100 bg-gradient-to-br from-white to-rose-50/50 p-5 sm:p-6"><div className="grid gap-5 sm:grid-cols-3">{profile.lastSeenLocation && <Detail icon={MapPin} label="Location" value={profile.lastSeenLocation} />}{profile.lastSeenDate && <Detail icon={CalendarDays} label="Date" value={profile.lastSeenDate} />}{profile.lastSeenTime && <Detail icon={Clock3} label="Time" value={profile.lastSeenTime} />}</div></Card></section>}
    {profile.rewardAvailable && profile.rewardText && <section aria-labelledby="reward-available"><Card className="border-amber-200 bg-amber-50/70 p-5 sm:p-6"><div className="flex gap-4"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-800"><Gift className="h-5 w-5" /></div><div><h2 id="reward-available" className="font-semibold text-foreground">Reward available</h2><p className="mt-1 leading-6 text-muted-foreground">{profile.rewardText}</p></div></div></Card></section>}
    {profile.importantNotes?.length ? <section aria-labelledby="important-notes"><h2 id="important-notes" className="text-2xl font-semibold tracking-tight text-foreground">Important notes</h2><Card className="mt-4 border-rose-100 px-5 sm:px-6"><ul className="divide-y divide-neutral-100">{profile.importantNotes.map((note) => <li key={note} className="flex items-center gap-3 py-4 text-[15px] font-medium text-foreground"><AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />{note}</li>)}</ul></Card></section> : null}
  </div>;
}
