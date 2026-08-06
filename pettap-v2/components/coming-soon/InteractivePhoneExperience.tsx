"use client";

import { Check, LockKeyhole, RefreshCw, Radio } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

import IphoneMockup from "@/components/landing/phone-preview/IphoneMockup";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { motionTokens, premiumEase } from "@/lib/theme/motion";
import { spacing } from "@/lib/theme/spacing";

import { phoneScreens } from "./InteractivePhoneScreens";

const highlights = [
  ["No app required", Radio],
  ["Secure profile", LockKeyhole],
  ["Update anytime", RefreshCw],
  ["Built around your privacy", Check],
] as const;

const screenLabels = ["NFC detected", "Pet profile", "Medical information", "Emergency contacts", "Safely reunited"] as const;

export default function InteractivePhoneExperience() {
  const reducedMotion = useReducedMotion();
  const [activeScreen, setActiveScreen] = useState(0);

  useEffect(() => {
    if (reducedMotion) return;

    const timer = window.setInterval(() => {
      setActiveScreen((current) => (current + 1) % phoneScreens.length);
    }, 3600);

    return () => window.clearInterval(timer);
  }, [reducedMotion]);

  const visibleScreen = reducedMotion ? 1 : activeScreen;
  const ActiveScreen = phoneScreens[visibleScreen];

  return (
    <section id="experience" aria-labelledby="experience-title" className={`relative z-10 overflow-hidden bg-[#fbfbfa] px-6 ${spacing.sectionY}`}>
      <div aria-hidden="true" className="pointer-events-none absolute bottom-[-15rem] right-[-10rem] size-[36rem] rounded-full bg-sky-100/55 blur-3xl" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[minmax(0,0.88fr)_minmax(23rem,0.72fr)] lg:gap-20 lg:px-8">
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 18, filter: "blur(7px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: reducedMotion ? 0 : motionTokens.duration.reveal, ease: premiumEase }}
          className="max-w-xl"
        >
          <SectionHeader eyebrow="A simple tap" id="experience-title" title="See what happens with one tap" description="Anyone with a modern smartphone can instantly access the information you choose to share." />
          <ul className="mt-9 grid gap-3 sm:grid-cols-2">
            {highlights.map(([label, Icon]) => <li key={label} className="flex items-center gap-2.5 text-sm font-medium text-neutral-700"><span className="flex size-6 items-center justify-center rounded-full border border-black/[0.07] bg-white text-neutral-900 shadow-sm"><Icon className="size-3.5" aria-hidden="true" /></span>{label}</li>)}
          </ul>
          <a href="#interactive-phone" className="mt-10 inline-flex min-h-12 items-center justify-center rounded-2xl bg-neutral-950 px-6 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(17,17,17,0.13)] transition duration-300 hover:-translate-y-0.5 hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-neutral-950/15 motion-reduce:transition-none">Explore the experience</a>
        </motion.div>

        <motion.div
          id="interactive-phone"
          initial={reducedMotion ? false : { opacity: 0, y: 24, filter: "blur(10px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: reducedMotion ? 0 : 0.72, ease: premiumEase }}
          className="relative scroll-mt-10 mx-auto flex h-[590px] w-full max-w-[22rem] items-start justify-center sm:h-[665px] sm:max-w-[25rem] lg:h-[690px]"
        >
          <motion.div animate={reducedMotion ? undefined : { y: [0, -6, 0] }} transition={{ duration: motionTokens.duration.float, repeat: Infinity, ease: "easeInOut" }} className="origin-top scale-[0.73] sm:scale-[0.83] lg:scale-[0.86]">
            <IphoneMockup staticFrame>
              <div className="relative h-full w-full" role="group" aria-label="PetTap phone demonstration">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={visibleScreen}
                    initial={reducedMotion ? false : { opacity: 0, x: 12, filter: "blur(3px)" }}
                    animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                    exit={reducedMotion ? undefined : { opacity: 0, x: -10, filter: "blur(2px)" }}
                    transition={{ duration: reducedMotion ? 0 : 0.38, ease: premiumEase }}
                    className="absolute inset-0"
                  >
                    <ActiveScreen />
                  </motion.div>
                </AnimatePresence>
              </div>
            </IphoneMockup>
          </motion.div>
          <div role="group" aria-label={`Screen ${visibleScreen + 1} of ${phoneScreens.length}: ${screenLabels[visibleScreen]}`} className="absolute bottom-0 left-1/2 flex -translate-x-1/2 gap-2">
            {screenLabels.map((label, index) => <span key={label} aria-hidden="true" className={`size-2 rounded-full transition-colors duration-300 motion-reduce:transition-none ${visibleScreen === index ? "bg-neutral-950" : "bg-neutral-300"}`} />)}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
