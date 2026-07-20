"use client";

import {
  ShieldCheck,
  Smartphone,
  Palette,
  HeartHandshake,
  ArrowRight,
} from "lucide-react";

import Container from "@/components/layout/Container";
import { FadeUp } from "@/components/animations";

const features = [
  {
    icon: Smartphone,
    title: "Instant Scan",
    description:
      "A simple tap with any modern smartphone instantly reveals your pet's important information.",
  },
  {
    icon: ShieldCheck,
    title: "Private & Secure",
    description:
      "Only the information you choose is shared, giving you complete control over your pet's profile.",
  },
  {
    icon: Palette,
    title: "Made to Match",
    description:
      "Personalise colours, names, fonts and exclusive collections to create something truly unique.",
  },
  {
    icon: HeartHandshake,
    title: "No Subscription",
    description:
      "Buy it once and enjoy it forever. No monthly fees, no hidden costs, just peace of mind.",
  },
];

export default function WhyPetTap() {
  return (
    <section className="relative overflow-hidden py-28">

      {/* Background */}

      <div className="absolute inset-0 -z-10">
        <div className="absolute left-0 top-24 h-72 w-72 rounded-full bg-sky-500/10 blur-[120px]" />
        <div className="absolute right-0 bottom-0 h-96 w-96 rounded-full bg-violet-500/10 blur-[160px]" />
      </div>

      <Container>

        <FadeUp>
          <div className="mx-auto max-w-3xl text-center">

            <span className="inline-flex rounded-full border border-sky-100 bg-sky-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-sky-700">
              Why PetTap
            </span>

            <h2 className="mt-6 font-heading text-4xl font-bold tracking-tight text-foreground lg:text-6xl">
              Built for the moments
              <br />
              that matter most.
            </h2>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
              PetTap combines elegant design with smart NFC technology to help
              lost pets find their families faster, while giving owners complete
              freedom to personalise every tag.
            </p>

          </div>
        </FadeUp>

        <div className="mt-20 grid gap-6 md:grid-cols-2">

          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <FadeUp
                key={feature.title}
                delay={0.08 * index}
              >
                <div
                  className="
                    group
                    relative
                    overflow-hidden
                    rounded-[32px]
                    border
                    border-neutral-200/70
                    bg-white/80
                    p-8
                    shadow-sm
                    backdrop-blur-xl
                    transition-all
                    duration-300
                    hover:-translate-y-1
                    hover:border-sky-200
                    hover:shadow-2xl
                  "
                >
                  <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-sky-500/5 blur-3xl transition-all duration-500 group-hover:bg-sky-500/10" />

                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 shadow-lg">

                    <Icon className="h-8 w-8 text-white" />

                  </div>

                  <h3 className="mt-8 text-2xl font-semibold tracking-tight">
                    {feature.title}
                  </h3>

                  <p className="mt-4 leading-7 text-muted-foreground">
                    {feature.description}
                  </p>

                  <div className="mt-8 flex items-center gap-2 text-sm font-semibold text-sky-600 opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100">

                    Learn more

                    <ArrowRight className="h-4 w-4" />

                  </div>

                </div>
              </FadeUp>
            );
          })}

        </div>

      </Container>

    </section>
  );
}