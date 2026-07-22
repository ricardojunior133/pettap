"use client";

import Image from "next/image";
import { Check } from "lucide-react";
import { motion } from "framer-motion";

import { FadeUp } from "@/components/animations";
import Container from "@/components/layout/Container";
import Card from "@/components/ui/Card";

const tagVisuals = {
  petTap: "/images/tag/black.png",
} as const;

const traditionalBenefits = [
  "Limited engraving",
  "One contact number",
  "Information cannot be updated",
  "Medical information unavailable",
  "Can wear over time",
];

const petTapBenefits = [
  "Secure digital profile",
  "Multiple emergency contacts",
  "Update information anytime",
  "Medical information",
  "Instant NFC access",
  "Designed for everyday adventures",
  "No subscription",
  "Works with modern smartphones",
];

function BenefitList({ items, featured = false }: { items: string[]; featured?: boolean }) {
  return (
    <ul className="mt-8 grid gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3 text-sm leading-6 text-muted-foreground">
          <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${featured ? "bg-sky-500 text-white" : "bg-neutral-100 text-neutral-500"}`}>
            <Check className="h-3 w-3" strokeWidth={2.5} />
          </span>
          {item}
        </li>
      ))}
    </ul>
  );
}

function TagIllustration({ type }: { type: "traditional" | "pettap" }) {
  if (type === "pettap") {
    return (
      <div className="relative flex h-40 items-center justify-center overflow-hidden rounded-[28px] bg-sky-50/80">
        <div className="absolute h-28 w-28 rounded-full bg-sky-300/20 blur-2xl" />
        <Image
          src={tagVisuals.petTap}
          alt="PetTap NFC tag"
          width={136}
          height={136}
          sizes="136px"
          className="relative h-[136px] w-[136px] drop-shadow-[0_18px_20px_rgba(0,0,0,.24)] transition-transform duration-500 group-hover:scale-105"
        />
      </div>
    );
  }

  return (
    <div className="relative flex h-40 items-center justify-center overflow-hidden rounded-[28px] bg-neutral-50">
      <div className="relative flex h-28 w-24 flex-col items-center justify-center rounded-[42%] border border-neutral-300 bg-gradient-to-br from-neutral-100 via-white to-neutral-200 shadow-[0_14px_24px_rgba(0,0,0,.12)]">
        <span className="absolute top-3 h-3 w-3 rounded-full border border-neutral-300 bg-neutral-50 shadow-inner" />
        <span className="mt-4 text-[9px] font-semibold tracking-[0.16em] text-neutral-500">CHARLIE</span>
        <span className="mt-1 text-[7px] tracking-wide text-neutral-400">07700 900123</span>
      </div>
    </div>
  );
}

export default function TheDifference() {
  return (
    <section className="relative overflow-hidden bg-white py-24 lg:py-32">
      <Container>
        <FadeUp>
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-700">The PetTap difference</p>
            <h2 className="mt-6 font-heading text-4xl font-bold tracking-tight text-foreground lg:text-6xl">
              The difference is just one tap.
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
              Traditional tags only identify your pet. PetTap helps bring them home.
            </p>
          </div>
        </FadeUp>

        <div className="mx-auto mt-16 grid max-w-6xl gap-6 lg:grid-cols-2">
          <FadeUp delay={0.08}>
            <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.25, ease: "easeOut" }} className="group h-full">
              <Card className="h-full p-7 transition-shadow duration-300 group-hover:shadow-md lg:p-9">
                <TagIllustration type="traditional" />
                <p className="mt-8 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Traditional Tag</p>
                <h3 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">A familiar starting point.</h3>
                <BenefitList items={traditionalBenefits} />
              </Card>
            </motion.div>
          </FadeUp>

          <FadeUp delay={0.14}>
            <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.3, ease: "easeOut" }} className="group h-full">
              <Card className="relative h-full overflow-hidden border-sky-200 bg-white p-7 shadow-[0_20px_54px_rgba(14,116,144,.10)] transition-shadow duration-300 group-hover:shadow-[0_28px_70px_rgba(14,116,144,.16)] lg:p-9">
                <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-sky-400/[0.12] blur-3xl transition-opacity duration-500 group-hover:bg-sky-400/[0.18]" />
                <div className="relative">
                  <TagIllustration type="pettap" />
                  <p className="mt-8 text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">PetTap</p>
                  <h3 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">A safer way forward.</h3>
                  <BenefitList items={petTapBenefits} featured />
                </div>
              </Card>
            </motion.div>
          </FadeUp>
        </div>

        <FadeUp delay={0.16}>
          <p className="mx-auto mt-16 max-w-xl text-center text-2xl font-medium leading-9 tracking-tight text-foreground">
            One small tag. <span className="text-sky-700">One simple tap.</span> One safe journey home.
          </p>
        </FadeUp>
      </Container>
    </section>
  );
}
