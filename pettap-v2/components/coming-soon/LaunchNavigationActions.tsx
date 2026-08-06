"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";

import { PublicAccountActions } from "@/components/auth/PublicAccountActions";

type LaunchNavigationActionsProps = { contactAvailable: boolean; followUrl: string | null; isAuthenticated: boolean; showAbout: boolean };

export default function LaunchNavigationActions({ contactAvailable, followUrl, isAuthenticated, showAbout }: LaunchNavigationActionsProps) {
  const [open, setOpen] = useState(false);

  return <div className="flex items-center gap-2">
    <div className="hidden items-center gap-3 text-sm font-medium text-neutral-600 md:flex">
      {showAbout ? <a href="#about" className="rounded-sm transition hover:text-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2">About</a> : null}
      {contactAvailable ? <Link href="/contact" className="rounded-sm transition hover:text-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2">Contact</Link> : null}
      {followUrl ? <a href={followUrl} target="_blank" rel="noreferrer" className="hidden rounded-sm transition hover:text-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 lg:inline">Follow</a> : null}
      <PublicAccountActions isAuthenticated={isAuthenticated} />
    </div>
    <Link href={isAuthenticated ? "/dashboard" : "/register"} className="inline-flex min-h-11 items-center rounded-xl bg-neutral-950 px-3.5 text-sm font-semibold text-white transition hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-neutral-950/15 md:hidden">{isAuthenticated ? "Dashboard" : "Create account"}</Link>
    <button type="button" className="inline-flex size-11 items-center justify-center rounded-xl border border-black/[0.09] bg-white text-neutral-800 transition hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-neutral-950/15 md:hidden" aria-controls="public-mobile-navigation" aria-expanded={open} aria-label={open ? "Close navigation" : "Open navigation"} onClick={() => setOpen((value) => !value)}>{open ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}</button>
    {open ? <div id="public-mobile-navigation" className="absolute right-6 top-[calc(100%_-_4px)] z-20 w-[min(20rem,calc(100vw-3rem))] rounded-2xl border border-black/[0.09] bg-white p-3 shadow-[0_18px_50px_rgba(17,17,17,0.12)] md:hidden">
      <div className="flex flex-col gap-1">
        {showAbout ? <a href="#about" onClick={() => setOpen(false)} className="rounded-xl px-3 py-3 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50">About</a> : null}
        {contactAvailable ? <Link href="/contact" onClick={() => setOpen(false)} className="rounded-xl px-3 py-3 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50">Contact</Link> : null}
        {followUrl ? <a href={followUrl} target="_blank" rel="noreferrer" className="rounded-xl px-3 py-3 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50">Follow the journey</a> : null}
      </div>
      <div className="mt-3 grid gap-2 border-t border-black/[0.06] pt-3"><PublicAccountActions isAuthenticated={isAuthenticated} compact /></div>
    </div> : null}
  </div>;
}
