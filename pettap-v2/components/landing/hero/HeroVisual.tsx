"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import IphoneMockup from "@/components/landing/phone-preview/IphoneMockup";
import DetectingScreen from "@/components/landing/phone-preview/screens/DetectingScreen";
import PetProfile from "@/components/landing/phone-preview/screens/PetProfile";
import SplashScreen from "@/components/landing/phone-preview/screens/SplashScreen";

type HeroStage = "ready" | "reading" | "profile";

interface HeroVisualProps {
  compact?: boolean;
}

export default function HeroVisual({ compact = false }: HeroVisualProps) {
  const reducedMotion = useReducedMotion();
  const [stage, setStage] = useState<HeroStage>("ready");
  const visibleStage: HeroStage = reducedMotion ? "profile" : stage;

  useEffect(() => {
    if (reducedMotion) {
      return;
    }

    const playSequence = () => {
      setStage("ready");
      window.setTimeout(() => setStage("reading"), 2600);
      window.setTimeout(() => setStage("profile"), 4200);
    };

    playSequence();
    const interval = window.setInterval(playSequence, 9400);

    return () => window.clearInterval(interval);
  }, [reducedMotion]);

  const isReading = visibleStage === "reading";
  const phoneOffset = isReading ? (compact ? -20 : -54) : 0;

  return (
    <div
      className={`relative mx-auto overflow-visible ${
        compact ? "h-[430px] w-full max-w-[520px]" : "h-[820px] w-[900px]"
      }`}
    >
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-[72%] w-[72%] rounded-full bg-sky-300/10 blur-[110px]" />
      </div>

      <div
        className={`absolute bottom-[8%] left-1/2 h-8 w-[64%] -translate-x-1/2 rounded-full bg-black/15 blur-2xl ${
          compact ? "opacity-70" : ""
        }`}
      />

      <motion.div
        className={`absolute z-10 ${compact ? "left-[17%] top-0 w-[66%]" : "left-[32%] top-[7%] w-[54%]"}`}
        animate={reducedMotion ? undefined : { y: [0, -4, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <Image
          src="/images/hero/golden.png"
          alt="Golden Retriever wearing a PetTap tag on its collar"
          width={760}
          height={1140}
          priority
          sizes={compact ? "(max-width: 1023px) 68vw" : "580px"}
          className="h-auto w-full drop-shadow-[0_35px_70px_rgba(0,0,0,.2)]"
        />
      </motion.div>

      <motion.div
        className={`absolute z-30 ${compact ? "left-[18%] top-[24%] scale-[0.38] origin-top-left" : "left-[16%] top-[14%] scale-[0.66] origin-top-left"}`}
        animate={
          reducedMotion
            ? undefined
            : {
                x: isReading ? [0, phoneOffset, phoneOffset + 2, phoneOffset] : phoneOffset,
                y: isReading ? [0, 1, -1, 0] : [0, -2, 0],
                rotateZ: isReading ? [0, -0.6, 0.5, 0] : [0, 0.3, 0],
              }
        }
        transition={{
          duration: isReading ? 1.35 : 4.8,
          repeat: isReading ? 0 : Infinity,
          ease: "easeInOut",
        }}
      >
        <IphoneMockup staticFrame>
          <AnimatePresence mode="wait">
            <motion.div
              key={visibleStage}
              className="h-full w-full"
              initial={reducedMotion ? false : { opacity: 0, scale: 0.985 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.015 }}
              transition={{ duration: 0.38, ease: "easeOut" }}
            >
              {visibleStage === "ready" && <SplashScreen />}
              {visibleStage === "reading" && <DetectingScreen />}
              {visibleStage === "profile" && <PetProfile />}
            </motion.div>
          </AnimatePresence>
        </IphoneMockup>
      </motion.div>

      <motion.div
        aria-hidden="true"
        className={`pointer-events-none absolute z-40 text-sky-500/70 ${
          compact ? "left-[49%] top-[45%]" : "left-[48%] top-[46%]"
        }`}
        animate={reducedMotion ? { opacity: 0 } : { opacity: isReading ? [0, 1, 0.7, 0] : 0, scale: isReading ? [0.9, 1, 1.04, 1] : 0.9 }}
        transition={{ duration: 1.3, ease: "easeInOut" }}
      >
        <svg width="42" height="42" viewBox="0 0 42 42" fill="none" stroke="currentColor" strokeWidth="1.4">
          <path d="M14 14a10 10 0 0 1 14 14" />
          <path d="M9 9a17 17 0 0 1 24 24" />
          <path d="M19 19a3 3 0 0 1 4 4" />
        </svg>
      </motion.div>

      <div className={`absolute z-40 ${compact ? "bottom-[2%] left-[12%] w-[34%]" : "bottom-[2%] left-[27%] w-[30%]"}`}>
        <Image
          src="/images/hero/cat.png"
          alt=""
          width={260}
          height={220}
          loading="eager"
          sizes={compact ? "120px" : "210px"}
          className="h-auto w-full opacity-95 drop-shadow-[0_20px_35px_rgba(0,0,0,.16)]"
        />
      </div>

      <div className={`absolute z-40 ${compact ? "bottom-[2%] right-[1%] w-[23%]" : "bottom-[2%] right-[1%] w-[24%]"}`}>
        <Image
          src="/images/hero/pug.png"
          alt=""
          width={180}
          height={270}
          sizes={compact ? "88px" : "150px"}
          className="h-auto w-full opacity-95 drop-shadow-[0_20px_35px_rgba(0,0,0,.16)]"
        />
      </div>
    </div>
  );
}
