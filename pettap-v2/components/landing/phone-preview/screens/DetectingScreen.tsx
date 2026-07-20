"use client";

import { motion } from "framer-motion";
import { WifiHigh } from "lucide-react";

export default function DetectingScreen() {
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-white">

      {/* Glow */}
      <motion.div
        className="absolute h-80 w-80 rounded-full bg-sky-400/20 blur-[110px]"
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.15, 0.35, 0.15],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* NFC Rings */}
      {[0, 1, 2].map((ring) => (
        <motion.div
          key={ring}
          className="absolute rounded-full border border-sky-400/40"
          style={{
            width: 110,
            height: 110,
          }}
          animate={{
            scale: [1, 2.4],
            opacity: [0.5, 0],
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            delay: ring * 0.45,
            ease: "easeOut",
          }}
        />
      ))}

      {/* Icon */}
      <motion.div
        animate={{
          y: [0, -6, 0],
          scale: [1, 1.04, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
        }}
        className="relative z-10 flex h-24 w-24 items-center justify-center rounded-full bg-sky-500 text-white shadow-xl"
      >
        <WifiHigh size={42} />
      </motion.div>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 mt-10 text-center"
      >
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">
          NFC Tag Detected
        </h2>

        <p className="mt-3 text-sm text-zinc-500">
          Reading PetTap information...
        </p>
      </motion.div>

      {/* Progress */}
      <div className="absolute bottom-28 h-1 w-40 overflow-hidden rounded-full bg-zinc-200">
        <motion.div
          className="h-full rounded-full bg-sky-500"
          animate={{
            x: ["-100%", "100%"],
          }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

    </div>
  );
}