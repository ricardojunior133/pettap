"use client";

import { useStudio } from "../StudioContext";

export default function NameInput() {
  const { studio, updateStudio } = useStudio();

  return (
    <div>
      <input
        value={studio.petName}
        onChange={(e) =>
          updateStudio({
            petName: e.target.value,
          })
        }
        placeholder="Charlie"
        maxLength={12}
        aria-label="Pet name"
        className="w-full rounded-2xl border border-black/[0.10] bg-white px-5 py-4 text-base font-medium text-neutral-950 outline-none transition placeholder:font-normal placeholder:text-neutral-400 focus:border-black focus:ring-4 focus:ring-black/[0.06]"
      />

      <p className="mt-2 flex justify-between text-xs text-neutral-400">
        <span>Up to 12 characters</span>
        <span>{studio.petName.length}/12</span>
      </p>
    </div>
  );
}
