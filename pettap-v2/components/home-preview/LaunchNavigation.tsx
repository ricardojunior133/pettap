import Link from "next/link";

import LaunchNavigationActions from "./LaunchNavigationActions";

export default function LaunchNavigation({
  isAuthenticated = false,
}: {
  isAuthenticated?: boolean;
}) {
  return (
    <nav className="relative z-10 mx-auto flex min-h-20 max-w-6xl items-center justify-between gap-4 px-6 lg:px-8" aria-label="Public navigation">
      <Link href="/" className="text-xl font-semibold tracking-[-0.05em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950">
        PetTap
      </Link>
      <LaunchNavigationActions isAuthenticated={isAuthenticated} />
    </nav>
  );
}
