import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function StudioHeader() {
  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-10">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-medium text-neutral-500 transition hover:text-black"
        >
          <ArrowLeft size={18} />
          Back Home
        </Link>

        <div className="text-center">
          <h1 className="text-lg font-semibold tracking-tight">
            PetTap Studio
          </h1>

          <p className="text-sm text-neutral-500">
            Design something worth coming home to.
          </p>
        </div>

        <div className="w-24" />
      </div>
    </header>
  );
}