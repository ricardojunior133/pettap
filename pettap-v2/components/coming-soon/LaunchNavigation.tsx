import Link from "next/link";

import { launchConfig } from "@/lib/launch/config";

export default function LaunchNavigation({ showAbout = false }: { showAbout?: boolean }) {
  const followUrl = launchConfig.instagramUrl;

  return (
    <nav className="relative z-10 mx-auto flex h-20 max-w-6xl items-center justify-between px-6 lg:px-8">
      <Link
        href="/"
        className="text-xl font-semibold tracking-[-0.05em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950"
      >
        PetTap
      </Link>
      <div className="flex items-center gap-5 text-sm font-medium text-neutral-600">
        {showAbout && <a href="#about" className="hidden rounded-sm transition hover:text-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 sm:inline">About</a>}
        {launchConfig.contactEmail && <Link href="/contact" className="hidden rounded-sm transition hover:text-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 sm:inline">Contact</Link>}
        {followUrl && (
          <a
            href={followUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl bg-neutral-950 px-4 py-2.5 text-white transition hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-neutral-950/15"
          >
            Follow the journey
          </a>
        )}
      </div>
    </nav>
  );
}
