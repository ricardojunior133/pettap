"use client";

import Image from "next/image";
import { motion, MotionValue, useReducedMotion } from "framer-motion";

interface FloatingTagProps {
  x: MotionValue<number>;
  y: MotionValue<number>;
  rotate: MotionValue<number>;
  scale: MotionValue<number>;
}

export default function FloatingTag({
  x,
  y,
  rotate,
  scale,
}: FloatingTagProps) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      className="absolute left-[18%] top-1/2 z-30 hidden -translate-y-1/2 lg:block"
      animate={reducedMotion ? undefined : {
        y: [0, -8, 0],
      }}
      transition={reducedMotion ? undefined : {
        duration: 3.5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      style={{
        x,
        y,
        rotate,
        scale,
      }}
    >
      <div className="relative">
        <div className="absolute inset-0 scale-110 rounded-full bg-sky-400/10 blur-2xl" />

        <motion.div
          animate={reducedMotion ? undefined : {
            rotateY: [0, 5, 0, -5, 0],
          }}
          transition={reducedMotion ? undefined : {
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            transformStyle: "preserve-3d",
          }}
        >
          <Image
            src="/images/tag/black.png"
            alt="PetTap Tag"
            width={180}
            height={180}
            priority
            className="drop-shadow-[0_30px_35px_rgba(0,0,0,0.35)]"
          />
        </motion.div>
      </div>
    </motion.div>
  );
}
