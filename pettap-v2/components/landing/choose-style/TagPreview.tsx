"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { TagVariant } from "./colors";

interface TagPreviewProps {
  variant: TagVariant;
}

const shadows = {
  black: "0 60px 120px rgba(0,0,0,.18)",
  silver: "0 60px 120px rgba(180,180,180,.25)",
  blue: "0 60px 120px rgba(59,130,246,.22)",
  purple: "0 60px 120px rgba(139,92,246,.22)",
};

export default function TagPreview({ variant }: TagPreviewProps) {
  return (
    <motion.div
      animate={{
        backgroundColor: variant.bg,
      }}
      transition={{
        duration: .5,
      }}
      className="relative overflow-hidden rounded-[48px] py-24"
    >
      {/* Ambient Glow */}

      <motion.div
        animate={{
          backgroundColor: variant.accent,
        }}
        transition={{ duration: .5 }}
        className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px] opacity-10"
      />

      {/* Pedestal */}

      <div className="absolute bottom-24 left-1/2 h-6 w-72 -translate-x-1/2 rounded-full bg-black/5 blur-xl" />

      <AnimatePresence mode="wait">

        <motion.div
          key={variant.id}
          initial={{
            opacity: 0,
            scale: .92,
            rotate: -6,
          }}
          animate={{
            opacity: 1,
            scale: 1,
            rotate: 0,
            y: [0, -10, 0],
          }}
          exit={{
            opacity: 0,
            scale: .92,
            rotate: 6,
          }}
          transition={{
            duration: .55,
            y: {
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            },
          }}
          className="relative mx-auto w-fit"
          style={{
            filter: `drop-shadow(${shadows[variant.id]})`,
          }}
        >
          <Image
            src={variant.image}
            alt={variant.name}
            width={520}
            height={520}
            priority
            className="select-none"
          />
        </motion.div>

      </AnimatePresence>

      {/* Product Name */}

      <motion.div
        key={variant.name}
        initial={{ opacity:0,y:10 }}
        animate={{ opacity:1,y:0 }}
        transition={{ duration:.4 }}
        className="mt-12 text-center"
      >
        <h3
          className="text-3xl font-semibold tracking-tight"
          style={{ color: variant.accent }}
        >
          {variant.name}
        </h3>

        <p className="mt-3 text-slate-500">
          {variant.subtitle}
        </p>
      </motion.div>

    </motion.div>
  );
}