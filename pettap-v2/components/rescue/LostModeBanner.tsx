"use client";

import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

export default function LostModeBanner({ petName }: { petName: string }) {
  const [isVisible, setIsVisible] = useState(true);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const syncVisibility = () => setIsVisible(window.scrollY < 12);
    window.addEventListener("scroll", syncVisibility, { passive: true });
    syncVisibility();
    return () => window.removeEventListener("scroll", syncVisibility);
  }, []);

  return <AnimatePresence>{isVisible && <motion.aside initial={reduceMotion ? false : { opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="fixed inset-x-0 top-0 z-50 border-b border-rose-200 bg-[#fff8f7]/95 px-4 py-3 text-center shadow-[0_8px_24px_rgba(79,24,21,.12)] backdrop-blur-md" role="status"><p className="mx-auto flex max-w-3xl items-center justify-center gap-2 text-sm font-medium text-[#6e2520]"><AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" /><span>This pet has been reported missing. If you have seen {petName}, please contact the owner immediately.</span></p></motion.aside>}</AnimatePresence>;
}
