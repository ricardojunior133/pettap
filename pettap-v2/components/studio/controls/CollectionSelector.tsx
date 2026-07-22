"use client";

import clsx from "clsx";

import { useStudio } from "../StudioContext";
import { COLLECTIONS } from "@/lib/collections";

export default function CollectionSelector() {
  const { studio, updateStudio } = useStudio();

  return (
    <div className="grid gap-3">
        {COLLECTIONS.map((collection) => {
          const active = studio.collection === collection.id;

          return (
            <button
              key={collection.id}
              type="button"
              onClick={() =>
                updateStudio({
                  collection: collection.id,
                })
              }
              aria-pressed={active}
              className={clsx(
                "rounded-2xl border p-4 text-left transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/25 active:scale-[0.985] sm:p-5",
                active
                  ? "border-black bg-neutral-950 text-white shadow-lg"
                  : "border-black/[0.08] bg-white hover:-translate-y-0.5 hover:border-black/25 hover:shadow-lg"
              )}
            >
              <div className="flex items-center gap-4">
                <div
                  className={clsx("flex h-12 w-12 items-center justify-center rounded-2xl text-2xl transition-transform duration-300", active && "scale-105")}
                  style={{ backgroundColor: active ? "rgba(255,255,255,0.12)" : collection.accent }}
                >
                  {collection.icon}
                </div>

                <div className="flex-1">
                  <h4 className="text-base font-semibold">
                    {collection.name}
                  </h4>

                  <p className={clsx("mt-1 text-sm", active ? "text-white/65" : "text-neutral-500")}>
                    {collection.description}
                  </p>
                </div>

                {active && (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white">
                    ✓
                  </div>
                )}
              </div>
            </button>
          );
        })}
    </div>
  );
}
