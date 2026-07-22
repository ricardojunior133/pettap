"use client";

import { motion, MotionValue, useReducedMotion } from "framer-motion";

interface Props {
  opacity: MotionValue<number>;
  scale: MotionValue<number>;
}

export default function NFCPulse({
  opacity,
  scale,
}: Props) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      style={{
        opacity,
        scale,
      }}
      className="pointer-events-none absolute left-[45%] top-1/2 z-20 -translate-y-1/2"
    >
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full border border-sky-400/35"
          animate={reducedMotion ? { opacity: 0.22, scale: 1 + i * 0.18 } : {
            scale: [0.2, 2.2],
            opacity: [0.55, 0],
          }}
          transition={reducedMotion ? { duration: 0 } : {
            duration: 1.8,
            repeat: Infinity,
            delay: i * 0.35,
            ease: "easeOut",
          }}
        />
      ))}
    </motion.div>
  );
}
