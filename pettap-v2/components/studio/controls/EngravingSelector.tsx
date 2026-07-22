"use client";

import clsx from "clsx";

import { useStudio } from "../StudioContext";

const fonts = [
  { id: "classic", label: "Classic", sample: "PetTap", className: "font-serif" },
  { id: "rounded", label: "Rounded", sample: "PetTap", className: "font-sans" },
  { id: "modern", label: "Modern", sample: "PetTap", className: "font-mono" },
  { id: "editorial", label: "Editorial", sample: "PetTap", className: "font-serif italic" },
  { id: "monogram", label: "Monogram", sample: "PetTap", className: "font-serif uppercase tracking-[0.1em]" },
] as const;

const iconGroups = [
  { label: "Animals", icons: [{ id: "paw", label: "Paw" }, { id: "bone", label: "Bone" }, { id: "fish", label: "Fish" }, { id: "cat", label: "Cat" }] },
  { label: "Nature", icons: [{ id: "leaf", label: "Leaf" }, { id: "moon", label: "Moon" }] },
  { label: "Minimal", icons: [{ id: "diamond", label: "Diamond" }] },
  { label: "Classic", icons: [{ id: "heart", label: "Heart" }, { id: "star", label: "Star" }] },
  { label: "Cute", icons: [{ id: "flower", label: "Flower" }] },
  { label: "Luxury", icons: [{ id: "crown", label: "Crown" }] },
] as const;

export default function EngravingSelector({ mode = "all" }: { mode?: "font" | "icon" | "all" }) {
  const { studio, updateStudio } = useStudio();

  return (
    <div className="space-y-7">
      {mode !== "icon" && <div>
        <div className="mb-3 flex items-baseline justify-between">
          <p className="text-sm font-medium text-neutral-900">Choose a lettering style</p>
          <p className="text-xs text-neutral-400">Live preview</p>
        </div>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {fonts.map((font) => {
            const active = studio.engravingFont === font.id;
            return (
              <button
                key={font.id}
                type="button"
                onClick={() => updateStudio({ engravingFont: font.id })}
                aria-pressed={active}
                className={clsx(
                  "rounded-2xl border px-3 py-4 text-left transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/25 active:scale-[0.98]",
                  active ? "border-black bg-neutral-950 text-white shadow-lg" : "border-black/[0.08] bg-white hover:-translate-y-0.5 hover:border-black/25"
                )}
              >
                <span className={clsx("block text-lg", font.className)}>{font.sample}</span>
                <span className={clsx("mt-2 block text-xs font-medium", active ? "text-white/65" : "text-neutral-500")}>{font.label}</span>
              </button>
            );
          })}
        </div>
      </div>}

      {mode !== "font" && <div>
        <div className="mb-3 flex items-baseline justify-between"><p className="text-sm font-medium text-neutral-900">Add a small signature <span className="font-normal text-neutral-400">(optional)</span></p><button type="button" onClick={() => updateStudio({ engravingIcon: "none" })} className="text-xs font-medium text-neutral-500 underline-offset-4 hover:text-neutral-950 hover:underline">Clear</button></div>
        <div className="space-y-4">
          {iconGroups.map((group) => <div key={group.label}><p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400">{group.label}</p><div className="flex flex-wrap gap-2">
          {group.icons.map((icon) => {
            const active = studio.engravingIcon === icon.id;
            return (
              <button
                key={icon.id}
                type="button"
                onClick={() => updateStudio({ engravingIcon: icon.id })}
                aria-pressed={active}
                className={clsx(
                  "rounded-full border px-3 py-2 text-xs font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/25 active:scale-95",
                  active ? "border-black bg-black text-white" : "border-black/[0.08] bg-white text-neutral-600 hover:border-black/25 hover:text-black"
                )}
              >
                {icon.label}
              </button>
            );
          })}</div></div>)}
        </div>
      </div>}
    </div>
  );
}
