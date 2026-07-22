"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useState } from "react";

const links = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#tags", label: "PetTap Essential" },
  { href: "/#studio-preview", label: "Studio" },
  { href: "/#faq", label: "FAQ" },
];

export default function Navbar() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useMotionValueEvent(scrollY, "change", (value) => setScrolled(value > 20));

  return <motion.header initial={{ y: -24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.45 }} className="fixed inset-x-0 top-0 z-50">
    <div className={`mx-auto mt-3 w-[calc(100%-24px)] max-w-7xl rounded-[22px] px-4 transition-all duration-300 sm:px-5 ${scrolled || open ? "border border-black/[0.08] bg-white/90 shadow-[0_12px_32px_rgba(17,17,17,0.08)] backdrop-blur-xl" : "bg-white/60 backdrop-blur-sm"}`}>
      <div className="flex h-16 items-center justify-between gap-4">
        <Link href="/" className="text-lg font-semibold tracking-[-0.04em] text-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-4">PetTap</Link>
        <nav className="hidden items-center gap-6 lg:flex" aria-label="Main navigation">{links.map((link) => <a key={link.href} href={link.href} className="text-sm font-medium text-neutral-600 transition hover:text-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-4">{link.label}</a>)}</nav>
        <div className="flex items-center gap-2"><Link href="/studio" className="hidden rounded-xl bg-neutral-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-neutral-950/15 sm:inline-flex">Personalise your tag</Link><button type="button" className="inline-flex size-10 items-center justify-center rounded-xl text-neutral-800 transition hover:bg-black/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 lg:hidden" onClick={() => setOpen(!open)} aria-label={open ? "Close navigation" : "Open navigation"} aria-expanded={open}>{open ? <X className="size-5" /> : <Menu className="size-5" />}</button></div>
      </div>
      {open && <nav className="border-t border-black/[0.06] py-3 lg:hidden" aria-label="Mobile navigation">{links.map((link) => <a key={link.href} href={link.href} onClick={() => setOpen(false)} className="block rounded-xl px-3 py-3 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950">{link.label}</a>)}<Link href="/studio" onClick={() => setOpen(false)} className="mt-1 block rounded-xl bg-neutral-950 px-3 py-3 text-sm font-semibold text-white">Personalise your tag</Link></nav>}
    </div>
  </motion.header>;
}
