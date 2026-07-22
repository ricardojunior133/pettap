"use client";

import { useStudio } from "../StudioContext";
import clsx from "clsx";
import { TAG_FINISHES } from "@/lib/finishes";

export default function ColourSelector() {
  const { studio, updateStudio } = useStudio();

  const selected =
    TAG_FINISHES.find((c) => c.value === studio.colour) ?? TAG_FINISHES[0];

  return (
    <div>
      <div className="flex flex-wrap gap-2.5 sm:gap-3">
        {TAG_FINISHES.map((colour) => {
          const active = studio.colour === colour.value;

          return (
            <button
              key={colour.value}
              type="button"
              onClick={() =>
                updateStudio({
                  colour: colour.value,
                })
              }
              aria-label={`Choose ${colour.name}`}
              aria-pressed={active}
              className={clsx(
                "flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/25 active:scale-95 sm:h-14 sm:w-14",
                active
                  ? "scale-105 ring-1 ring-black ring-offset-4"
                  : "hover:scale-105"
              )}
            >
              <span
                className={clsx("h-10 w-10 rounded-full border shadow-sm transition-transform duration-300", active && "scale-110 shadow-md")}
                style={{
                  backgroundColor: colour.value,
                }}
              />
            </button>
          );
        })}
      </div>

      <div className="mt-6 rounded-2xl border border-black/[0.05] bg-neutral-50 p-4 transition-colors duration-300">
        <div className="flex items-center gap-3">
          <span className="h-5 w-5 rounded-full border border-black/10 shadow-sm" style={{ backgroundColor: selected.value }} />
          <span className="text-sm font-medium text-neutral-900">{selected.name}</span>
          <span className="ml-auto text-[11px] font-medium uppercase tracking-[0.16em] text-neutral-400">Selected</span>
        </div>
        <p className="mt-2 pl-8 text-xs leading-5 text-neutral-500">{selected.description}</p>
      </div>
    </div>
  );
}
