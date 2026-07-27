import Link from "next/link";

import { logoutAction } from "@/features/auth/actions/auth-actions";

const navigation = [
  { href: "/account", label: "Overview" },
  { href: "/account/orders", label: "Orders" },
  { href: "/account/profile", label: "Profile" },
] as const;

export function AccountShell({ children, email }: { children: React.ReactNode; email: string | null }) {
  return (
    <div className="min-h-screen bg-[#f7f7f5] text-neutral-950">
      <header className="border-b border-black/[0.07] bg-white/90 px-5 py-4 backdrop-blur sm:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-5">
          <Link href="/" className="text-xl font-semibold tracking-[-0.05em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-4">PetTap</Link>
          <form action={logoutAction}>
            <button className="rounded-xl px-3 py-2 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2" type="submit">Log out</button>
          </form>
        </div>
      </header>
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[13rem_minmax(0,1fr)] lg:py-12">
        <aside className="lg:sticky lg:top-8 lg:h-fit" aria-label="Account navigation">
          <p className="truncate text-sm font-medium text-neutral-600">{email ?? "Your PetTap account"}</p>
          <nav className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible" aria-label="Account pages">
            {navigation.map((item) => (
              <Link key={item.href} href={item.href} className="shrink-0 rounded-xl px-3 py-2.5 text-sm font-semibold text-neutral-700 transition hover:bg-white hover:text-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2">{item.label}</Link>
            ))}
          </nav>
        </aside>
        <main id="account-content" className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
