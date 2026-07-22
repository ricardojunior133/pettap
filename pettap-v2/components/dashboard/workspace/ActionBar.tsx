import Link from "next/link";
import type { ReactNode } from "react";
import { AlertTriangle, ExternalLink, Pencil, Share2 } from "lucide-react";

import type { WorkspaceAction } from "@/lib/dashboard";

const icons = { edit: Pencil, alert: AlertTriangle, profile: ExternalLink, share: Share2 };

export default function ActionBar({ actions, children }: { actions: WorkspaceAction[]; children?: ReactNode }) {
  return <section aria-label="Pet quick actions" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{actions.map((action) => { const Icon = icons[action.icon]; const content = <><Icon className="h-5 w-5" /><span><span className="block font-semibold">{action.label}</span><span className="mt-0.5 block text-sm font-normal text-muted-foreground">{action.description}</span></span></>; return action.href ? <Link key={action.label} href={action.href} className="flex min-h-[84px] items-center gap-3 rounded-2xl border border-sky-200 bg-sky-50/60 px-4 text-left text-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:bg-sky-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600">{content}</Link> : <div key={action.label} title="Coming soon" className="flex min-h-[84px] items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-4 text-muted-foreground shadow-sm"><Icon className="h-5 w-5 text-sky-700" /><span><span className="block font-semibold text-foreground">{action.label}</span><span className="mt-0.5 block text-sm">{action.description}</span><span className="mt-1 block text-xs font-semibold text-sky-700">Coming soon</span></span></div>; })}{children}</section>;
}
