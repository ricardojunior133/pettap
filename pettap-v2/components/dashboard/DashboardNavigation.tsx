import { LayoutDashboard } from "lucide-react";

import type { DashboardNavigationItem } from "@/lib/dashboard";

export default function DashboardNavigation({ items }: { items: DashboardNavigationItem[] }) {
  return <nav aria-label="Owner dashboard"><ul className="flex items-center gap-1 overflow-x-auto rounded-2xl bg-neutral-100/80 p-1.5">{items.map((item) => <li key={item.label}>{item.active ? <span aria-current="page" className="flex min-h-10 items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-foreground shadow-sm"><LayoutDashboard className="h-4 w-4 text-sky-700" />{item.label}</span> : <span className="flex min-h-10 items-center rounded-xl px-4 text-sm font-medium text-muted-foreground" title={`${item.label} coming soon`}>{item.label}</span>}</li>)}</ul></nav>;
}
