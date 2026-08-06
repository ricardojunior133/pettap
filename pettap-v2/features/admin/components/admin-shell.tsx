import Link from "next/link";
import { ClipboardList, Cog, Home, Package, PawPrint, ShieldCheck, Tags, Users, Radio } from "lucide-react";
import type { ReactNode } from "react";

import { logoutAction } from "@/features/auth/actions/auth-actions";

import type { AdminPermissionCode } from "../constants/access";
import { adminRoleLabels } from "../constants/access";
import type { AdminContextViewModel } from "../types/admin";

const navigation: Array<{ href?: string; label: string; icon: typeof Home; permission: AdminPermissionCode }> = [
  { href: "/admin", label: "Overview", icon: Home, permission: "admin.dashboard.read" },
  { href: "/admin/event-demo", label: "Event demo", icon: Radio, permission: "event_demo.view" },
  { href: "/admin/customers", label: "Customers", icon: Users, permission: "customers.read" },
  { label: "Pets", icon: PawPrint, permission: "pets.read" },
  { label: "NFC tags", icon: Tags, permission: "tags.read" },
  { href: "/admin/orders", label: "Orders", icon: ClipboardList, permission: "orders.read" },
  { href: "/admin/production", label: "Production", icon: Package, permission: "production.read" },
  { href: "/admin/packing", label: "Packing", icon: Package, permission: "production.update" },
  { href: "/admin/shipping", label: "Shipping", icon: Package, permission: "fulfilments.dispatch" },
  { href: "/admin/fulfilments", label: "Fulfilments", icon: Package, permission: "fulfilments.read" },
  { label: "Products", icon: Package, permission: "products.read" },
  { label: "Settings", icon: Cog, permission: "settings.read" },
  { label: "Team access", icon: ShieldCheck, permission: "admins.manage" },
];

export function AdminShell({ children, context }: { children: ReactNode; context: AdminContextViewModel }) {
  const visibleNavigation = navigation.filter((item) => context.permissions.includes(item.permission));
  const roleLabel = adminRoleLabels[context.role];

  return <div className="min-h-screen bg-neutral-50 text-neutral-950">
    <aside className="fixed inset-y-0 hidden w-64 border-r border-black/[0.06] bg-white p-5 lg:block">
      <Link href="/admin" className="text-xl font-semibold tracking-[-0.05em]">PetTap <span className="text-neutral-400">Admin</span></Link>
      <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">{roleLabel}</p>
      <nav className="mt-9 space-y-1" aria-label="Administration navigation">
        {visibleNavigation.map(({ href, label, icon: Icon }) => href ? <Link key={label} href={href} aria-current="page" className="flex min-h-11 items-center gap-3 rounded-xl bg-neutral-100 px-3 text-sm font-medium text-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950"><Icon className="size-4" aria-hidden="true" />{label}</Link> : <span key={label} aria-disabled="true" className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-neutral-400"><Icon className="size-4" aria-hidden="true" />{label}<span className="ml-auto text-[10px] font-semibold uppercase tracking-[0.1em]">Soon</span></span>)}
      </nav>
      <div className="absolute inset-x-5 bottom-6 border-t border-black/[0.06] pt-4">
        <Link href="/dashboard" className="flex min-h-11 items-center rounded-xl px-3 text-sm font-medium text-neutral-600 transition hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950">Customer dashboard</Link>
        <form action={logoutAction} className="mt-1"><button className="flex min-h-11 w-full items-center rounded-xl px-3 text-left text-sm font-medium text-neutral-600 transition hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950" type="submit">Sign out</button></form>
      </div>
    </aside>
    <div className="lg:pl-64">
      <header className="flex min-h-16 items-center justify-between border-b border-black/[0.06] bg-white px-5 sm:px-8">
        <Link href="/admin" className="text-lg font-semibold tracking-[-0.04em] lg:hidden">PetTap Admin</Link>
        <p className="ml-auto rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-semibold text-neutral-600">{roleLabel}</p>
      </header>
      <nav className="overflow-x-auto border-b border-black/[0.06] bg-white px-5 py-3 lg:hidden" aria-label="Administration navigation">{visibleNavigation.map(({ href, label }) => href ? <Link key={label} href={href} aria-current="page" className="mr-1 inline-flex min-h-10 items-center rounded-xl bg-neutral-100 px-3 text-sm font-medium text-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950">{label}</Link> : <span key={label} aria-disabled="true" className="mr-1 inline-flex min-h-10 items-center rounded-xl px-3 text-sm font-medium text-neutral-400">{label}</span>)}</nav>
      <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-12">{children}</main>
    </div>
  </div>;
}
