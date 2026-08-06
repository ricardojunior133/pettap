"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export function EventDemoPetPhoto({ alt, src }: { alt: string; src: string }) {
  const [loaded, setLoaded] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (imageRef.current?.complete && imageRef.current.naturalWidth > 0) {
      setLoaded(true);
      return;
    }

    const revealTimer = window.setTimeout(() => setLoaded(true), 350);
    return () => window.clearTimeout(revealTimer);
  }, [src]);

  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-[28px] bg-neutral-100 shadow-[0_18px_55px_rgba(0,0,0,0.14)]">
      <div aria-hidden="true" className={`absolute inset-0 animate-pulse bg-gradient-to-br from-neutral-100 via-neutral-50 to-neutral-200 transition-opacity duration-200 ${loaded ? "opacity-0" : "opacity-100"}`} />
      <motion.div animate={{ opacity: 1, scale: loaded && !reduceMotion ? 1.015 : 1 }} className="absolute inset-0" initial={false} transition={{ duration: reduceMotion ? 0 : 0.22, ease: "easeOut" }}>
        <Image alt={alt} className="object-cover" fill onLoad={() => setLoaded(true)} priority ref={imageRef} sizes="(max-width: 768px) 100vw, 560px" src={src} unoptimized />
      </motion.div>
    </div>
  );
}
