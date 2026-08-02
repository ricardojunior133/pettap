import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";

type DividerProps = ComponentPropsWithoutRef<"div"> & {
  orientation?: "horizontal" | "vertical";
};

/** A decorative divider. Use a semantic separator when it conveys document structure. */
export function Divider({ className, orientation = "horizontal", ...props }: DividerProps) {
  return <div aria-hidden="true" className={cn("bg-black/[0.07]", orientation === "horizontal" ? "h-px w-full" : "h-full w-px self-stretch", className)} {...props} />;
}

export type { DividerProps };
