"use client";

import Link from "next/link";

import { logoutAction } from "@/features/auth/actions/auth-actions";

export function PublicAccountActions({ isAuthenticated, compact = false, primaryHref = "/register", primaryLabel = "Create account" }: { isAuthenticated: boolean; compact?: boolean; primaryHref?: string; primaryLabel?: string }) {
  const shared = compact ? "w-full justify-center" : "";

  if (isAuthenticated) {
    return <><form action={logoutAction} className={compact ? "w-full" : undefined}><button type="submit" className={`inline-flex min-h-11 items-center rounded-xl border border-black/[0.09] bg-white px-4 text-sm font-semibold text-neutral-800 transition hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-neutral-950/15 ${shared}`}>Log out</button></form><Link href="/dashboard" className={`inline-flex min-h-11 items-center rounded-xl bg-neutral-950 px-4 text-sm font-semibold text-white transition hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-neutral-950/15 ${shared}`}>Dashboard</Link></>;
  }

  return <><Link href="/login" className={`inline-flex min-h-11 items-center rounded-xl border border-black/[0.09] bg-white px-4 text-sm font-semibold text-neutral-800 transition hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-neutral-950/15 ${shared}`}>Log in</Link><a href={primaryHref} className={`inline-flex min-h-11 items-center rounded-xl bg-neutral-950 px-4 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-neutral-950/15 motion-reduce:transition-none ${shared}`}>{primaryLabel}</a></>;
}
