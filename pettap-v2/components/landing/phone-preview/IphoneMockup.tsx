"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

interface IphoneMockupProps {
  children: ReactNode;
}

export default function IphoneMockup({
  children,
}: IphoneMockupProps) {
  return (
    <motion.div
      className="relative"
      animate={{
        y: [0, -6, 0],
        rotateZ: [0, 0.35, 0, -0.35, 0],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {/* Ambient Glow */}

      <div className="absolute inset-0 scale-110 rounded-[64px] bg-sky-400/10 blur-[70px]" />

      {/* Ground Shadow */}

      <div className="absolute bottom-0 left-8 right-8 h-16 rounded-full bg-black/20 blur-[40px]" />

      {/* Phone */}

      <div className="relative h-[720px] w-[360px] rounded-[58px] bg-[#1A1A1A] p-[5px] shadow-[0_40px_120px_rgba(0,0,0,.40)]">

        {/* Titanium Frame */}

        <div className="absolute inset-0 rounded-[58px] border border-white/15" />

        <div className="absolute inset-[2px] rounded-[56px] border border-white/5" />

        <div className="absolute inset-[3px] rounded-[55px] bg-gradient-to-b from-white/[0.05] via-transparent to-black/[0.12]" />

        {/* Screen */}

        <div className="relative h-full w-full overflow-hidden rounded-[52px] bg-black">

          {/* Glass Reflection */}

          <motion.div
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/15 via-white/5 to-transparent"
            animate={{
              opacity: [0.08, 0.18, 0.08],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Moving Reflection */}

          <motion.div
            className="pointer-events-none absolute -left-32 top-0 h-full w-20 rotate-12 bg-white/10 blur-2xl"
            animate={{
              x: [-80, 420],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "linear",
            }}
          />

          {/* Bottom Vignette */}

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/10" />

          {/* Dynamic Island */}

          <div className="absolute left-1/2 top-3 z-50 h-8 w-32 -translate-x-1/2 rounded-full bg-black shadow-inner shadow-white/10">

            <div className="absolute left-1/2 top-3 h-[2px] w-10 -translate-x-1/2 rounded-full bg-neutral-700" />

          </div>

          {/* Screen */}

          <div className="relative h-full w-full">
            {children}
          </div>
        </div>

        {/* Buttons */}

        <div className="absolute -left-[3px] top-36 h-14 w-[3px] rounded-l-full bg-neutral-600" />

        <div className="absolute -right-[3px] top-40 h-24 w-[3px] rounded-r-full bg-neutral-600" />

        <div className="absolute -right-[3px] top-72 h-14 w-[3px] rounded-r-full bg-neutral-600" />
      </div>
    </motion.div>
  );
}