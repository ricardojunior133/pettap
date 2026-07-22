import Link from "next/link";

import { launchConfig } from "@/lib/launch/config";

export default function LaunchFooter() {
  return (
    <footer className="relative z-10 border-t border-black/[0.06] px-6 py-9">
      <div className="mx-auto flex max-w-6xl flex-col gap-5 text-sm text-neutral-500 sm:flex-row sm:items-center sm:justify-between">
        <span className="font-semibold tracking-[-0.03em] text-neutral-950">PetTap</span>
        <div className="flex flex-wrap gap-5">
          <Link href="/privacy" className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2">Privacy</Link>
          <Link href="/terms" className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2">Terms</Link>
          {launchConfig.contactEmail && <Link href="/contact" className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2">Contact</Link>}
        </div>
        <span>Launching Autumn 2026 {"\uD83C\uDDEC\uD83C\uDDE7"}</span>
        <span>{"\u00A9"} {new Date().getFullYear()} PetTap</span>
      </div>
    </footer>
  );
}
