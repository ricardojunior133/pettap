"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface FloatProps {
  children: ReactNode;
  duration?: number;
  distance?: number;
  className?: string;
}

export default function Float({
  children,
  duration = 6,
  distance = 12,
  className = "",
}: FloatProps) {
  return (
    <motion.div
      className={className}
      animate={{
        y: [-distance, distance, -distance],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {children}
    </motion.div>
  );
}