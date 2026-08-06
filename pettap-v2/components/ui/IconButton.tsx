import type { ReactNode } from "react";

import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type IconButtonProps = Omit<ButtonProps, "children" | "size" | "leftIcon" | "rightIcon"> & {
  label: string;
  icon: ReactNode;
  size?: "sm" | "md" | "lg";
};

/** An accessible icon-only button with a mandatory text alternative. */
export function IconButton({ label, icon, size = "md", className, ...props }: IconButtonProps) {
  const sizeClass = size === "sm" ? "size-9" : size === "lg" ? "size-12" : "size-11";

  return (
    <Button aria-label={label} className={cn(sizeClass, "p-0", className)} size="icon" {...props}>
      {icon}
      <span className="sr-only">{label}</span>
    </Button>
  );
}

export type { IconButtonProps };
