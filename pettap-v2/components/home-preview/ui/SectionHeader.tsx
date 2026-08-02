import type { ReactNode } from "react";

import { typography } from "../theme/typography";
import { cn } from "@/lib/utils";

type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  id?: string;
  align?: "left" | "center";
  action?: ReactNode;
  className?: string;
};

/** A consistent hierarchy for marketing and application section introductions. */
export function SectionHeader({
  eyebrow,
  title,
  description,
  id,
  align = "left",
  action,
  className,
}: SectionHeaderProps) {
  const centred = align === "center";

  return (
    <div className={cn(centred && "mx-auto text-center", className)}>
      {eyebrow ? <p className={typography.eyebrow}>{eyebrow}</p> : null}
      <h2 id={id} className={cn(eyebrow && "mt-5", typography.heading)}>{title}</h2>
      {description ? <p className={cn("mt-5", centred && "mx-auto", typography.description)}>{description}</p> : null}
      {action ? <div className={cn("mt-8", centred && "flex justify-center")}>{action}</div> : null}
    </div>
  );
}

export type { SectionHeaderProps };
