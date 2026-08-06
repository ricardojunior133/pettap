import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";

export type CardVariant = "surface" | "outlined" | "elevated" | "dark";

export type CardProps = ComponentPropsWithoutRef<"div"> & {
  variant?: CardVariant;
};

const cardVariants: Record<CardVariant, string> = {
  surface: "border-neutral-200 bg-white shadow-sm",
  outlined: "border-black/[0.09] bg-white",
  elevated: "border-black/[0.07] bg-white shadow-[0_18px_55px_rgba(0,0,0,0.10)]",
  dark: "border-neutral-950 bg-neutral-950 text-white shadow-[0_18px_55px_rgba(0,0,0,0.18)]",
};

function Card({ children, className, variant = "surface", ...props }: CardProps) {
  return (
    <div className={cn("rounded-3xl border", cardVariants[variant], className)} {...props}>
      {children}
    </div>
  );
}

export default Card;
export { Card, cardVariants };
