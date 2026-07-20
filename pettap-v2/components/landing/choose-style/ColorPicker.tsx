"use client";

import { motion } from "framer-motion";
import { TAG_VARIANTS, TagColor } from "./colors";

interface ColorPickerProps {
  value: TagColor;
  onChange: (color: TagColor) => void;
}

export default function ColorPicker({
  value,
  onChange,
}: ColorPickerProps) {
  return (
    <div className="mt-10 flex items-center justify-center gap-5">
      {TAG_VARIANTS.map((variant) => {
        const active = value === variant.id;

        return (
          <button
            key={variant.id}
            type="button"
            onClick={() => onChange(variant.id)}
            aria-label={variant.name}
            className="group relative"
          >
            {active && (
              <motion.span
                layoutId="active-ring"
                className="absolute inset-0 rounded-full border-2 border-slate-900"
                transition={{
                  type: "spring",
                  stiffness: 320,
                  damping: 25,
                }}
              />
            )}

            <motion.span
              whileHover={{
                scale: 1.12,
              }}
              whileTap={{
                scale: 0.94,
              }}
              animate={{
                scale: active ? 1.08 : 1,
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 20,
              }}
              className="flex h-11 w-11 items-center justify-center rounded-full"
            >
              <span
                className="h-7 w-7 rounded-full border border-black/10 shadow-sm"
                style={{
                  background: variant.accent,
                }}
              />
            </motion.span>
          </button>
        );
      })}
    </div>
  );
}