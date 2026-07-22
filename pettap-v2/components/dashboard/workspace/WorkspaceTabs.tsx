"use client";

import type { WorkspaceTab } from "@/lib/dashboard";

export default function WorkspaceTabs({ tabs, activeLabel, onSelect }: { tabs: WorkspaceTab[]; activeLabel: string; onSelect: (label: string) => void }) {
  return <nav aria-label="Pet workspace sections" className="overflow-x-auto"><ul className="flex min-w-max items-center gap-1 rounded-2xl bg-neutral-100/80 p-1.5">{tabs.map((tab) => { const active = tab.label === activeLabel; return <li key={tab.label}><button type="button" onClick={() => onSelect(tab.label)} aria-current={active ? "page" : undefined} className={`flex min-h-10 items-center rounded-xl px-4 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 ${active ? "bg-white font-semibold text-foreground shadow-sm" : "font-medium text-muted-foreground hover:bg-white/70 hover:text-foreground"}`}>{tab.label}</button></li>; })}</ul></nav>;
}
