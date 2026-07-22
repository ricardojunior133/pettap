"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

import FloatingTag from "./FloatingTag";
import IphoneMockup from "./IphoneMockup";
import PhoneScreen from "./PhoneScreen";
import NFCPulse from "./NFCPulse";
import { timeline } from "./timeline";
import PetProfile from "./screens/PetProfile";

export default function PhoneExperience() {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

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

  if (reducedMotion) {
    return (
      <section className="relative mx-auto mt-14 flex min-h-[620px] max-w-5xl items-center justify-center overflow-hidden rounded-[40px] border border-neutral-200 bg-neutral-50 px-6 py-16 lg:mt-20">
        <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-300/10 blur-[100px]" />
        <div className="relative z-10 mr-[-54px] hidden w-32 lg:block">
          <Image
            src="/images/tag/black.png"
            alt="PetTap tag"
            width={180}
            height={180}
            className="drop-shadow-[0_24px_32px_rgba(0,0,0,.24)]"
          />
        </div>
        <div className="relative z-20 scale-[0.72] origin-center sm:scale-[0.82]">
          <IphoneMockup staticFrame>
            <PetProfile />
          </IphoneMockup>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={ref}
      className="relative h-[300vh]"
    >
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">

        {/* Background Glow */}
        <motion.div
          className="absolute -left-32 top-1/2 h-[520px] w-[520px] rounded-full bg-sky-400/[0.07] blur-[150px]"
          animate={{
            opacity: [0.12, 0.26, 0.12],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="absolute right-[-120px] top-1/3 h-[420px] w-[420px] rounded-full bg-cyan-300/[0.06] blur-[140px]"
          animate={{
            opacity: [0.08, 0.2, 0.08],
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
        >
          <IphoneMockup>
            <PhoneScreen progress={scrollYProgress} />
          </IphoneMockup>
        </motion.div>

      </div>
    </section>
  );
}
