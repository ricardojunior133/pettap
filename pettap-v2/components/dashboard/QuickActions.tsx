import Link from "next/link";
import { AlertTriangle, Plus, Tag, UserRound } from "lucide-react";

import Card from "@/components/ui/Card";
import type { DashboardQuickAction } from "@/lib/dashboard";

const icons = { tag: Tag, plus: Plus, user: UserRound, alert: AlertTriangle };

export default function QuickActions({ actions }: { actions: DashboardQuickAction[] }) {
  return <section aria-labelledby="quick-actions"><div><p className="text-sm font-semibold uppercase tracking-[0.14em] text-sky-700">Ready when you are</p><h2 id="quick-actions" className="mt-1 text-3xl font-semibold tracking-tight text-foreground">Quick actions</h2></div><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{actions.map((action) => { const Icon = icons[action.icon]; const content = <><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-700"><Icon className="h-5 w-5" /></div><h3 className="mt-5 font-semibold text-foreground">{action.title}</h3><p className="mt-1 text-sm leading-5 text-muted-foreground">{action.description}</p><span className="mt-4 block text-sm font-medium text-sky-700">{action.href ? "Start activation" : "Coming soon"}</span></>; return action.href ? <Link key={action.title} href={action.href} className="rounded-3xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-600"><Card className="h-full p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-md">{content}</Card></Link> : <Card key={action.title} className="p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-md">{content}</Card>; })}</div></section>;
}
