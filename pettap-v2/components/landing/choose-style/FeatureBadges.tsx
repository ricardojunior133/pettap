"use client";

import {
  Battery,
  Droplets,
  ShieldCheck,
  SmartphoneNfc,
} from "lucide-react";

import FeatureCard from "./FeatureCard";

export default function FeatureBadges() {
  return (
    <div className="mt-24 grid gap-8 md:grid-cols-2 xl:grid-cols-4">

      <FeatureCard
        delay={0}
        icon={Droplets}
        title="Waterproof"
        description="Designed for rainy walks, muddy adventures and everyday life."
      />

      <FeatureCard
        delay={0.1}
        icon={SmartphoneNfc}
        title="NFC Enabled"
        description="Works instantly with modern smartphones. No app required."
      />

      <FeatureCard
        delay={0.2}
        icon={Battery}
        title="Battery-Free"
        description="No charging. No maintenance. Always ready to help."
      />

      <FeatureCard
        delay={0.3}
        icon={ShieldCheck}
        title="No Subscription"
        description="Buy once and use it forever without monthly fees."
      />

    </div>
  );
}