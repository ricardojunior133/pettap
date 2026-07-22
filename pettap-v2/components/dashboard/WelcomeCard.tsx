import { PawPrint, ShieldCheck, Tag } from "lucide-react";

import Card from "@/components/ui/Card";
import type { DashboardStat } from "@/lib/dashboard";

const icons = { pets: PawPrint, tag: Tag, shield: ShieldCheck };

export default function WelcomeCard({ stats }: { stats: DashboardStat[] }) {
  return <section aria-labelledby="dashboard-welcome"><Card className="overflow-hidden border-neutral-200 bg-gradient-to-br from-[#111111] via-[#1a1a1a] to-[#253247] p-6 text-white shadow-[0_22px_55px_rgba(17,17,17,.18)] sm:p-8"><p className="text-sm font-medium text-white/65">Your PetTap home</p><h2 id="dashboard-welcome" className="mt-2 max-w-xl text-3xl font-semibold tracking-tight sm:text-4xl">Everything your pets need, in one calm place.</h2><div className="mt-8 grid gap-3 sm:grid-cols-3">{stats.map((stat) => { const Icon = icons[stat.icon]; return <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/[.08] p-4 backdrop-blur-sm"><Icon className="h-5 w-5 text-sky-200" /><p className="mt-5 text-3xl font-semibold tracking-tight">{stat.value}</p><p className="mt-1 font-medium">{stat.label}</p><p className="mt-1 text-sm leading-5 text-white/60">{stat.detail}</p></div>; })}</div></Card></section>;
}
