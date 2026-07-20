"use client";

import {
  Battery,
  Droplets,
  SmartphoneNfc,
  ShieldCheck,
} from "lucide-react";

const features = [
  {
    icon: Droplets,
    title: "Waterproof",
    description: "Built for rain, mud and everyday adventures.",
  },
  {
    icon: SmartphoneNfc,
    title: "No App Needed",
    description: "Just tap with any compatible smartphone.",
  },
  {
    icon: Battery,
    title: "Battery-Free",
    description: "Always available. Nothing to recharge.",
  },
  {
    icon: ShieldCheck,
    title: "No Subscription",
    description: "One purchase. Lifetime use.",
  },
];

export default function FeatureStrip() {
  return (
    <section className="mt-24 border-y border-slate-200 py-16">
      <div className="grid gap-12 md:grid-cols-2 xl:grid-cols-4">
        {features.map(({ icon: Icon, title, description }) => (
          <div key={title} className="text-center">
            <Icon className="mx-auto h-8 w-8 text-slate-900" />

            <h3 className="mt-6 text-lg font-semibold">
              {title}
            </h3>

            <p className="mt-3 text-sm leading-7 text-slate-500">
              {description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}