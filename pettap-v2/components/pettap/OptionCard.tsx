"use client";

import { ReactNode } from "react";
import clsx from "clsx";

interface OptionCardProps {
  title: string;
  description?: ReactNode;
  icon?: ReactNode;
  selected?: boolean;
  onClick?: () => void;
}

export default function OptionCard({
  title,
  description,
  icon,
  selected = false,
  onClick,
}: OptionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={clsx(
        "w-full rounded-2xl border p-4 text-left transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/25 active:scale-[0.985] sm:p-5",
        "hover:-translate-y-0.5 hover:border-black/25 hover:shadow-lg",
        selected
          ? "border-black bg-neutral-950 text-white shadow-lg"
          : "border-black/[0.08] bg-white"
      )}
    >
      <div className="flex items-center gap-4">
        {icon && (
          <div className={clsx("flex h-10 w-10 items-center justify-center rounded-xl", selected ? "bg-white/10" : "bg-neutral-100")}>
            {icon}
          </div>
        )}

        <div className="flex-1">
          <h3 className="font-medium">{title}</h3>

          {description && (
            <div className={clsx("mt-1 text-sm", selected ? "text-white/65" : "text-neutral-500")}>
              {description}
            </div>
          )}
        </div>

        {selected && (
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-black text-xs text-white">
            ✓
          </div>
        )}
      </div>
    </button>
  );
}
