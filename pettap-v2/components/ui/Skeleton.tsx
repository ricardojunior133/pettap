import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";

/** A non-semantic loading placeholder; pair it with a parent loading label when needed. */
export function Skeleton({ className, ...props }: ComponentPropsWithoutRef<"div">) {
  return <div aria-hidden="true" className={cn("animate-pulse rounded-2xl bg-neutral-200", className)} {...props} />;
}
