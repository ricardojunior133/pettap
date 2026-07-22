"use client";

import clsx from "clsx";

import { TAG_DESIGNS } from "@/lib/designs";
import { useStudio } from "../StudioContext";

export default function DesignSelector() {
  const { studio, updateStudio } = useStudio();

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {TAG_DESIGNS.map((design) => {
          const active = studio.design === design.id;

          return (
            <button
              key={design.id}
              type="button"
              onClick={() =>
                updateStudio({
                  design: design.id,
                })
              }
              aria-pressed={active}
              className={clsx(
                "group relative min-h-36 rounded-2xl border p-4 text-left transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/25 active:scale-[0.98] sm:min-h-40 sm:p-5",
                active
                  ? "border-black bg-neutral-950 text-white shadow-[0_14px_30px_rgba(17,17,17,0.18)]"
                  : "border-black/[0.08] bg-white hover:-translate-y-0.5 hover:border-black/25 hover:shadow-lg"
              )}
            >
              <div className="text-4xl transition-transform duration-300 group-hover:scale-110">
                {design.icon}
              </div>

              <h4 className="mt-5 text-sm font-semibold">
                {design.name}
              </h4>

              <p className={clsx("mt-1 text-xs leading-5", active ? "text-white/65" : "text-neutral-500")}>
                {design.description}
              </p>
            </button>
          );
        })}
    </div>
  );
}
