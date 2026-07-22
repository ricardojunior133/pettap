import { Settings } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { DashboardNavigationItem, DashboardOwner } from "@/lib/dashboard";

import DashboardNavigation from "./DashboardNavigation";

export default function DashboardHeader({ owner, navigation }: { owner: DashboardOwner; navigation: DashboardNavigationItem[] }) {
  return <header className="border-b border-neutral-200/80 bg-white/85 backdrop-blur-xl"><div className="mx-auto max-w-6xl px-5 py-5 sm:px-8"><div className="flex items-center justify-between gap-4"><div className="flex items-center gap-3"><Avatar size="lg" className="bg-[#111111] text-white"><AvatarFallback className="bg-[#111111] font-semibold text-white">{owner.initials}</AvatarFallback></Avatar><div><p className="text-sm font-medium text-muted-foreground">{owner.greeting}</p><h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">{owner.name}</h1></div></div><button type="button" disabled title="Settings coming soon" className="flex min-h-11 items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 text-sm font-semibold text-muted-foreground shadow-sm"><Settings className="h-4 w-4" /><span className="hidden sm:inline">Settings</span></button></div><div className="mt-5"><DashboardNavigation items={navigation} /></div></div></header>;
}
