"use client";

import { motion } from "framer-motion";

export default function SplashScreen() {
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-black text-white">

      {/* Ambient Glow */}
      <motion.div
        className="absolute h-72 w-72 rounded-full bg-sky-500/15 blur-[100px]"
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.15, 0.35, 0.15],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* NFC Waves */}
      <div className="absolute flex items-center justify-center">
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className="absolute rounded-full border border-sky-400/30"
            style={{
              width: 90,
              height: 90,
            }}
            animate={{
              scale: [1, 2.8],
              opacity: [0.55, 0],
            }}
            transition={{
              duration: 2.4,
              repeat: Infinity,
              delay: index * 0.6,
              ease: "easeOut",
            }}
          />
        ))}
      </div>

      {/* Logo */}
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
          duration: 0.7,
        }}
        className="relative z-10 text-center"
      >
        <motion.h1
          animate={{
            opacity: [0.9, 1, 0.9],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
          }}
          className="text-4xl font-semibold tracking-tight"
        >
          PetTap
        </motion.h1>

        <p className="mt-3 text-xs uppercase tracking-[0.4em] text-white/55">
          Smart Pet Recovery
        </p>
      </motion.div>

      {/* NFC Icon */}
      <motion.div
        animate={{
          y: [0, -4, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="relative z-10 mt-12"
      >
        <svg
          width="46"
          height="46"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          className="text-sky-300"
        >
          <path d="M8 8a6 6 0 0 1 8 8" />
          <path d="M5 5a10 10 0 0 1 14 14" />
          <path d="M11 11a2 2 0 0 1 2 2" />
        </svg>
      </motion.div>

      {/* Status */}
      <motion.div
        className="absolute bottom-24 text-center"
        animate={{
          opacity: [0.45, 1, 0.45],
        }}
        transition={{
          duration: 1.8,
          repeat: Infinity,
        }}
      >
        <p className="text-sm font-medium">
          Hold near PetTap Tag
        </p>

        <p className="mt-2 text-xs tracking-[0.25em] uppercase text-white/40">
          Detecting NFC...
        </p>
      </motion.div>

    </div>
  );
}