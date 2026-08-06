import Link from "next/link";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
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

        <Button type="button" variant="ghost" size="sm" onClick={resetStudio} leftIcon={<RotateCcw className="size-3.5" />}>Start again</Button>
      </div>
    </header>
  );
}
