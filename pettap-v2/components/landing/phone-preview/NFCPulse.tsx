"use client";

import { motion, MotionValue } from "framer-motion";

interface Props {
  opacity: MotionValue<number>;
  scale: MotionValue<number>;
}

export default function NFCPulse({
  opacity,
  scale,
}: Props) {
  return (
    <motion.div
      style={{
        opacity,
        scale,
      }}
      className="absolute left-[34%] top-1/2 z-20 -translate-y-1/2 pointer-events-none"
    >
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-sky-400/60"
          animate={{
            scale: [0.2, 2.2],
            opacity: [0.55, 0],
          }}
          transition={{
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