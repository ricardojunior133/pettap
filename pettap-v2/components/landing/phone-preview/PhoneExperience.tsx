"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

import FloatingTag from "./FloatingTag";
import IphoneMockup from "./IphoneMockup";
import PhoneScreen from "./PhoneScreen";
import NFCPulse from "./NFCPulse";
import { timeline } from "./timeline";

export default function PhoneExperience() {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  /* ---------------- TAG ---------------- */

  const tagX = useTransform(
    scrollYProgress,
    timeline.tag.x,
    [-220, 0]
  );

  const tagY = useTransform(
    scrollYProgress,
    timeline.tag.y,
    [120, 0]
  );

  const tagRotate = useTransform(
    scrollYProgress,
    timeline.tag.rotate,
    [-20, 0]
  );

  const tagScale = useTransform(
    scrollYProgress,
    timeline.tag.scale,
    [0.75, 1]
  );

  /* ---------------- NFC ---------------- */

  const pulseOpacity = useTransform(
    scrollYProgress,
    timeline.nfc.opacity,
    [0, 1]
  );

  const pulseScale = useTransform(
    scrollYProgress,
    timeline.nfc.scale,
    [0.6, 1]
  );

  /* ---------------- PHONE ---------------- */

  const phoneScale = useTransform(
    scrollYProgress,
    timeline.phone.scale,
    [0.92, 1]
  );

  const phoneY = useTransform(
    scrollYProgress,
    timeline.phone.y,
    [60, 0]
  );

  return (
    <section
      ref={ref}
      className="relative h-[350vh]"
    >
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">

        {/* Background Glow */}
        <motion.div
          className="absolute -left-32 top-1/2 h-[520px] w-[520px] rounded-full bg-sky-400/10 blur-[150px]"
          animate={{
            opacity: [0.15, 0.45, 0.15],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="absolute right-[-120px] top-1/3 h-[420px] w-[420px] rounded-full bg-cyan-300/10 blur-[140px]"
          animate={{
            opacity: [0.1, 0.3, 0.1],
            scale: [1, 1.08, 1],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Floating NFC Tag */}
        <FloatingTag
          x={tagX}
          y={tagY}
          rotate={tagRotate}
          scale={tagScale}
        />

        {/* NFC Pulse */}
        <NFCPulse
          opacity={pulseOpacity}
          scale={pulseScale}
        />

        {/* iPhone */}
        <motion.div
          style={{
            y: phoneY,
            scale: phoneScale,
          }}
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
          <IphoneMockup>
            <PhoneScreen progress={scrollYProgress} />
          </IphoneMockup>
        </motion.div>

      </div>
    </section>
  );
}