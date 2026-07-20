"use client";

import Image from "next/image";
import { motion } from "framer-motion";

interface StorySectionProps {
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  reverse?: boolean;
}

export default function StorySection({
  eyebrow,
  title,
  description,
  image,
  reverse = false,
}: StorySectionProps) {
  return (
    <section className="py-32 lg:py-44">
      <div
        className={`mx-auto flex max-w-7xl flex-col items-center gap-20 px-6 lg:flex-row ${
          reverse ? "lg:flex-row-reverse" : ""
        }`}
      >
        <motion.div
          initial={{ opacity: 0, x: reverse ? 60 : -60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
          className="flex-1"
        >
          <span className="text-sm font-semibold uppercase tracking-[0.35em] text-primary">
            {eyebrow}
          </span>

          <h2 className="mt-6 text-5xl font-bold leading-tight tracking-tight text-slate-900 lg:text-6xl">
            {title}
          </h2>

          <p className="mt-8 max-w-xl text-xl leading-9 text-slate-600">
            {description}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
          className="flex flex-1 justify-center"
        >
          <Image
            src={image}
            alt={title}
            width={720}
            height={720}
            className="w-full max-w-xl drop-shadow-2xl"
            priority={false}
          />
        </motion.div>
      </div>
    </section>
  );
}