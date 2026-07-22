"use client";

import { useStudio } from "../StudioContext";
import OptionCard from "@/components/pettap/OptionCard";
import { TAG_SIZES } from "@/lib/sizes";
import { TAG_SPEC } from "@/lib/tag-spec";

export default function SizeSelector() {
  const { studio, updateStudio } = useStudio();

  return (
    <div className="grid gap-3 sm:grid-cols-3">
        {TAG_SIZES.map((size) => (
          <OptionCard
            key={size.id}
            title={size.title}
            description={
              <>
                <p>{size.description}</p>
                <div className="mt-3 flex items-center gap-2 text-xs font-medium text-current/75">
                  <span className="h-2 rounded-full bg-current/35" style={{ width: `${TAG_SPEC[size.id].diameter * 2}px` }} />
                  <span>{TAG_SPEC[size.id].diameter} mm diameter</span>
                </div>
                {size.recommendedFor && (
                  <div className="mt-3 border-t border-current/10 pt-3 text-xs leading-5">
                    <p className="font-medium">Recommended for</p>
                    <p className="mt-1 opacity-80">{size.recommendedFor.map((breed) => `• ${breed}`).join("  ")}</p>
                  </div>
                )}
              </>
            }
            selected={studio.size === size.id}
            onClick={() => updateStudio({ size: size.id })}
          />
        ))}
    </div>
  );
}
