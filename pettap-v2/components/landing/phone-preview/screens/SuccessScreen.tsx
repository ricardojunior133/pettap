"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

export default function SuccessScreen() {
  return (
    <div className="relative flex h-full flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-emerald-50 to-white px-8">

      {/* Glow */}

      <motion.div
        className="absolute h-64 w-64 rounded-full bg-emerald-400/20 blur-3xl"
        animate={{
          scale: [0.9, 1.15, 0.9],
          opacity: [0.2, 0.45, 0.2],
        }}
        transition={{
          repeat: Infinity,
          duration: 5,
        }}
      />

      <motion.div
        initial={{
          scale: 0.6,
          opacity: 0,
        }}
        animate={{
          scale: 1,
          opacity: 1,
        }}
        transition={{
          duration: 0.55,
        }}
        className="relative z-10"
      >
        <CheckCircle2
          className="h-24 w-24 text-emerald-500"
          strokeWidth={1.5}
        />
      </motion.div>

      <motion.h2
        className="relative z-10 mt-8 text-center text-3xl font-bold tracking-tight text-neutral-900"
        initial={{
          opacity: 0,
          y: 15,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          delay: 0.15,
        }}
      >
        Charlie is Safe ❤️
      </motion.h2>

      <motion.p
        className="relative z-10 mt-4 max-w-xs text-center leading-relaxed text-neutral-500"
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
        }}
        transition={{
          delay: 0.3,
        }}
      >
        Thanks to a simple tap,
        Charlie was reunited with
        his family safely.
      </motion.p>

    </div>
  );
}