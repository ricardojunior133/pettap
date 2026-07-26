"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

export function EventDemoProfileMotion({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className={className}
      initial={reduceMotion ? false : { opacity: 0, scale: 0.985, y: 12 }}
      transition={reduceMotion ? { duration: 0 } : { duration: 0.22, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
