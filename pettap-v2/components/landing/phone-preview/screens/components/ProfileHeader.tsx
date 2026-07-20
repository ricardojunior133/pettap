"use client";

import { motion } from "framer-motion";
import { Heart, ShieldCheck, Sparkles } from "lucide-react";

export default function ProfileHeader() {
  return (
    <div className="text-white">

      {/* Status */}

      <motion.div
        initial={{
          opacity: 0,
          y: -12,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.45,
        }}
        className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 backdrop-blur-xl"
      >
        <ShieldCheck className="h-4 w-4 text-emerald-300" />

        <span className="text-xs font-semibold tracking-[0.18em] uppercase">
          Verified Pet
        </span>
      </motion.div>

      {/* Name */}

      <motion.h2
        initial={{
          opacity: 0,
          y: 14,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          delay: 0.08,
          duration: 0.45,
        }}
        className="text-4xl font-black tracking-tight"
      >
        Charlie
      </motion.h2>

      {/* Breed */}

      <motion.p
        initial={{
          opacity: 0,
          y: 12,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          delay: 0.15,
          duration: 0.45,
        }}
        className="mt-2 text-base text-white/80"
      >
        Golden Retriever • 3 years old
      </motion.p>

      {/* Tags */}

      <motion.div
        initial={{
          opacity: 0,
          y: 12,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          delay: 0.25,
          duration: 0.45,
        }}
        className="mt-5 flex flex-wrap gap-2"
      >
        <Chip icon={<Heart className="h-3.5 w-3.5" />}>
          Friendly
        </Chip>

        <Chip icon={<ShieldCheck className="h-3.5 w-3.5" />}>
          Microchipped
        </Chip>

        <Chip icon={<Sparkles className="h-3.5 w-3.5" />}>
          Vaccinated
        </Chip>
      </motion.div>

    </div>
  );
}

interface ChipProps {
  children: React.ReactNode;
  icon: React.ReactNode;
}

function Chip({
  children,
  icon,
}: ChipProps) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-xl">
      {icon}
      {children}
    </div>
  );
}