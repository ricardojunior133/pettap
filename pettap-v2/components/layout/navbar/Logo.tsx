import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export default function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-3 transition-opacity hover:opacity-80"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
        <ShieldCheck className="h-5 w-5" />
      </div>

      <div className="flex flex-col">
        <span className="font-heading text-xl font-bold tracking-tight text-foreground">
          PetTap
        </span>

        <span className="-mt-1 text-xs text-muted-foreground">
          Smart Pet Recovery
        </span>
      </div>
    </Link>
  );
}