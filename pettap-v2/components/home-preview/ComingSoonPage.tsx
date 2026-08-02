import { Check, LockKeyhole, Radio, ShieldCheck } from "lucide-react";

import { launchConfig } from "@/lib/launch/config";
import { SectionHeader } from "./ui/SectionHeader";
import { spacing } from "./theme/spacing";

import LaunchFooter from "./LaunchFooter";
import HowPetTapWorks from "./HowPetTapWorks";
import InteractivePhoneExperience from "./InteractivePhoneExperience";
import LaunchNavigation from "./LaunchNavigation";
import CollectionsShowcase from "./CollectionsShowcase";
import FinalLaunchCTA from "./FinalLaunchCTA";
import PremiumComparison from "./PremiumComparison";
import PremiumFAQ from "./PremiumFAQ";
import PremiumHero from "./PremiumHero";
import ProductShowcase from "./ProductShowcase";
import TrustProofSection from "./TrustProofSection";

const benefits = [
  ["No app required", "Works instantly with NFC smartphones.", Radio],
  ["Secure & private", "Only the information you choose is shared.", LockKeyhole],
  ["Waterproof & durable", "Designed for everyday adventures.", ShieldCheck],
  ["Works worldwide", "Compatible with modern NFC smartphones globally.", Check],
] as const;

export default function ComingSoonPage({ isAuthenticated = false }: { isAuthenticated?: boolean }) {
  const followUrl = launchConfig.instagramUrl;

  return (
    <main className="min-h-screen overflow-x-clip bg-[#fbfbfa] text-neutral-950">
      <LaunchNavigation isAuthenticated={isAuthenticated} />

      <PremiumHero />

      <TrustProofSection />

      <HowPetTapWorks />

      <InteractivePhoneExperience />

      <PremiumComparison />

      <CollectionsShowcase />

      <ProductShowcase />

      <section id="about" className={`relative z-10 px-6 ${spacing.sectionY}`}>
        <div className="mx-auto max-w-6xl lg:px-8">
          <SectionHeader align="center" className="max-w-2xl" eyebrow="Built for everyday life" title="Made for the moments that matter." />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map(([title, description, Icon]) => (
              <article key={title} className="rounded-[28px] border border-black/[0.07] bg-white p-7 shadow-[0_12px_35px_rgba(17,17,17,0.035)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(17,17,17,0.06)] motion-reduce:transition-none">
                <span className="flex size-10 items-center justify-center rounded-2xl bg-neutral-950 text-white"><Icon className="size-4" aria-hidden="true" /></span>
                <h3 className="mt-7 text-xl font-semibold tracking-[-0.035em]">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-neutral-600">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <PremiumFAQ />

      <FinalLaunchCTA waitlistEnabled={launchConfig.waitlistEnabled} followUrl={followUrl} />

      <LaunchFooter />
    </main>
  );
}
