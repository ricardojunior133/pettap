import type { ComponentPropsWithoutRef } from "react";

import { radius } from "@/lib/theme/radius";
import { cn } from "@/lib/utils";

type ChipProps = ComponentPropsWithoutRef<"span"> & {
  tone?: "neutral" | "seasonal" | "exclusive";
};

const chipTones = {
  neutral: "border border-black/[0.08] bg-white text-neutral-600",
  seasonal: "border border-emerald-200 bg-emerald-50 text-emerald-800",
  exclusive: "border border-neutral-950 bg-neutral-950 text-white",
} as const;

/** A compact, non-interactive label for product and status context. */
export function Chip({ className, tone = "neutral", ...props }: ChipProps) {
  return (
    <span
      className={cn(
        `inline-flex items-center ${radius.pill} px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]`,
        chipTones[tone],
        className,
      )}
      {...props}
    />
  );
}

export type { ChipProps };
