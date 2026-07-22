import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useStudio } from "./StudioContext";

export default function StudioHeader() {
  const { resetStudio } = useStudio();
  return (
    <header className="border-b border-black/[0.06] bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-6 lg:px-8">
        <Link
          href="/"
          className="group flex items-center gap-2 text-sm font-medium text-neutral-500 transition-colors hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20"
        >
          <ArrowLeft size={17} className="transition-transform duration-200 group-hover:-translate-x-0.5" />
          <span className="hidden sm:inline">Back Home</span>
        </Link>

        <div className="text-center">
          <h1 className="text-base font-semibold tracking-[-0.02em]">
            PetTap Studio
          </h1>

          <p className="mt-0.5 hidden text-xs text-neutral-500 sm:block">
            Design something worth coming home to.
          </p>
        </div>

        <button type="button" onClick={resetStudio} className="min-h-10 rounded-xl px-3 text-xs font-semibold text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 sm:text-sm">Start again</button>
      </div>
    </header>
  );
}
