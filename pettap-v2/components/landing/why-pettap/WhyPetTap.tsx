"use client";

import {
  Check,
  Droplets,
  Globe2,
  HeartHandshake,
  MapPin,
  RefreshCw,
  ShieldCheck,
  Smartphone,
} from "lucide-react";

import { FadeUp } from "@/components/animations";
import Container from "@/components/layout/Container";
import Card from "@/components/ui/Card";

import FeatureCard from "../choose-style/FeatureCard";

const features = [
  {
    icon: Smartphone,
    title: "Instant Profile",
    description: "A simple tap opens the details that matter when time is precious.",
  },
  {
    icon: RefreshCw,
    title: "Always Up to Date",
    description: "Keep contact and care details current as your pet's life changes.",
  },
  {
    icon: Droplets,
    title: "Built for Adventures",
    description: "Lightweight and designed for the everyday adventures you share.",
  },
  {
    icon: ShieldCheck,
    title: "Privacy First",
    description: "Share only the information you choose, whenever a tag is tapped.",
  },
  {
    icon: Globe2,
    title: "No App Required",
    description: "A modern phone opens your pet's web profile right away.",
  },
  {
    icon: MapPin,
    title: "Designed in the UK",
    description: "Thoughtfully made for pet parents who expect more from a tag.",
  },
];

const traditionalTag = [
  "Limited engraving",
  "One phone number",
  "Information cannot be updated",
  "Can become unreadable",
];

const petTap = [
  "Secure digital profile",
  "Multiple emergency contacts",
  "Update information anytime",
  "Medical information",
  "Instant NFC access",
  "Designed for everyday adventures",
  "No subscription",
  "Works with modern smartphones",
];

function ComparisonList({ items, featured = false }: { items: string[]; featured?: boolean }) {
  return (
    <ul className="mt-8 space-y-4">
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

export default function WhyPetTap() {
  return (
    <section id="safety" className="relative scroll-mt-24 overflow-hidden bg-neutral-50/70 py-24 lg:py-32">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-0 top-20 h-72 w-72 rounded-full bg-sky-500/[0.07] blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-violet-500/[0.06] blur-[160px]" />
      </div>

      <Container>
        <FadeUp>
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex rounded-full border border-sky-100 bg-sky-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-sky-700">
              Why PetTap
            </span>

            <h2 className="mt-6 font-heading text-4xl font-bold tracking-tight text-foreground lg:text-6xl">
              Why pet owners choose PetTap
            </h2>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
              More than a pet tag. A smarter way to help your pet find their way home.
            </p>
          </div>
        </FadeUp>

        <div className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} {...feature} delay={index * 0.05} />
          ))}
        </div>

        <div className="mx-auto mt-24 max-w-5xl">
          <FadeUp>
            <div className="mb-8 flex items-end justify-between gap-6">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700">A clearer choice</p>
                <h3 className="mt-3 text-3xl font-semibold tracking-tight text-foreground lg:text-4xl">
                  Built for more than identification.
                </h3>
              </div>
              <HeartHandshake className="mb-1 hidden h-8 w-8 text-sky-600 lg:block" strokeWidth={1.5} />
            </div>
          </FadeUp>

          <div className="grid gap-5 lg:grid-cols-2">
            <FadeUp delay={0.08}>
              <Card className="h-full p-8 lg:p-10">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Traditional Pet Tag</p>
                <h4 className="mt-4 text-2xl font-semibold tracking-tight text-foreground">Useful, but limited.</h4>
                <ComparisonList items={traditionalTag} />
              </Card>
            </FadeUp>

            <FadeUp delay={0.14}>
              <Card className="relative h-full overflow-hidden border-sky-200 bg-white p-8 shadow-[0_22px_60px_rgba(14,116,144,.10)] lg:p-10">
                <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-sky-400/[0.10] blur-3xl" />
                <div className="relative">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">PetTap</p>
                  <h4 className="mt-4 text-2xl font-semibold tracking-tight text-foreground">Ready when it matters.</h4>
                  <ComparisonList items={petTap} featured />
                </div>
              </Card>
            </FadeUp>
          </div>
        </div>

        <FadeUp delay={0.12}>
          <p className="mx-auto mt-16 max-w-2xl text-center text-xl leading-8 tracking-tight text-foreground">
            Because when every second matters, finding your pet should be simple.
          </p>
        </FadeUp>
      </Container>
    </section>
  );
}
