"use client";

import Link from "next/link";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { useState } from "react";

export default function Navbar() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);

  useMotionValueEvent(scrollY, "change", (value) => {
    setScrolled(value > 20);
  });

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="fixed inset-x-0 top-0 z-50"
    >
      <div
        className={`mx-auto mt-4 flex h-16 w-[calc(100%-24px)] max-w-7xl items-center justify-between rounded-full px-6 transition-all duration-300 ${
          scrolled
            ? "border border-zinc-200/70 bg-white/80 shadow-lg backdrop-blur-xl"
            : "bg-transparent"
        }`}
      >
        <Link
          href="/"
          className="text-xl font-black tracking-tight"
        >
          PetTap
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <a
            href="#features"
            className="text-sm font-medium text-zinc-600 transition hover:text-black"
          >
            Features
          </a>

          <a
            href="#how"
            className="text-sm font-medium text-zinc-600 transition hover:text-black"
          >
            How it Works
          </a>

          <a
            href="#collections"
            className="text-sm font-medium text-zinc-600 transition hover:text-black"
          >
            Collections
          </a>
        </nav>

        <motion.a
          whileHover={{
            scale: 1.04,
          }}
          whileTap={{
            scale: 0.97,
          }}
          href="#cta"
          className="rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white shadow-lg"
        >
          Pre-order
        </motion.a>
      </div>
    </motion.header>
  );
}