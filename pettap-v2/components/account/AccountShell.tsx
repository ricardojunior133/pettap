import Link from "next/link";
import { CircleHelp, Home, MapPin, Package, PawPrint, Settings, ShieldCheck, Tag } from "lucide-react";
import type { ReactNode } from "react";

import { logoutAction } from "@/features/auth/actions/auth-actions";

const links = [
  ["/account", "Dashboard", Home], ["/account/pets", "My Pets", PawPrint], ["/account/tags", "My Tags", Tag],
  ["/account/orders", "Orders", Package], ["/account/addresses", "Addresses", MapPin], ["/account/settings", "Account Settings", Settings], ["/account/security", "Security", ShieldCheck],
] as const;

function Navigation() {
  return <nav aria-label="Customer portal"><div className="space-y-1">{links.map(([href, label, Icon]) => <Link key={href} href={href} className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950"><Icon className="size-4" aria-hidden="true" />{label}</Link>)}<span aria-disabled="true" className="flex min-h-11 cursor-not-allowed items-center gap-3 rounded-xl px-3 text-sm font-medium text-neutral-400"><CircleHelp className="size-4" aria-hidden="true" />Support <span className="ml-auto text-[10px] uppercase tracking-wider">Soon</span></span></div></nav>;
}

export function AccountShell({ children, userEmail }: { children: ReactNode; userEmail: string }) {
  return <div className="min-h-screen bg-[#fbfbfa] text-neutral-950"><aside className="fixed inset-y-0 hidden w-64 border-r border-black/[0.06] bg-white p-5 lg:block"><Link href="/account" className="text-xl font-semibold tracking-[-0.05em]">PetTap</Link><div className="mt-10"><Navigation /></div><div className="absolute inset-x-5 bottom-6"><p className="truncate px-3 text-xs text-neutral-500">{userEmail}</p><form action={logoutAction} className="mt-2"><button className="min-h-11 w-full rounded-xl px-3 text-left text-sm font-medium text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950">Sign out</button></form></div></aside><div className="lg:pl-64"><header className="border-b border-black/[0.06] bg-white lg:hidden"><details className="group"><summary className="flex min-h-16 cursor-pointer list-none items-center justify-between px-5 text-lg font-semibold tracking-[-0.04em]">PetTap <span className="text-sm font-medium text-neutral-500">Menu</span></summary><div className="border-t border-black/[0.06] px-3 py-3"><Navigation /><form action={logoutAction} className="mt-2"><button className="min-h-11 w-full rounded-xl px-3 text-left text-sm font-medium text-neutral-600 hover:bg-neutral-100">Sign out</button></form></div></details></header><main className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-12">{children}</main></div></div>;
}
