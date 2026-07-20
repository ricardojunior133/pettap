"use client";

import { motion } from "framer-motion";

interface GlowProps {
  className?: string;
}

export default function Glow({ className = "" }: GlowProps) {
  return (
    <motion.div
      animate={{
        scale: [1, 1.08, 1],
        opacity: [0.35, 0.5, 0.35],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className={`
        absolute rounded-full blur-[120px]
        bg-blue-500/20
        ${className}
      `}
    />
  );
}