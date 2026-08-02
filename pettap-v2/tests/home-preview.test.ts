import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const root = process.cwd();
const previewRoute = readFileSync(resolve(root, "app/home-preview/page.tsx"), "utf8");
const rootPage = readFileSync(resolve(root, "app/page.tsx"), "utf8");
const proxySource = readFileSync(resolve(root, "proxy.ts"), "utf8");
const heroSource = readFileSync(resolve(root, "components/home-preview/PremiumHero.tsx"), "utf8");
const navigationSource = readFileSync(resolve(root, "components/home-preview/LaunchNavigationActions.tsx"), "utf8");
const timelineSource = readFileSync(resolve(root, "components/home-preview/HowPetTapWorks.tsx"), "utf8");

describe("premium homepage preview", () => {
  it("keeps the approved Coming Soon homepage at the public root", () => {
    expect(rootPage).toContain("return <PremiumComingSoon />");
    expect(rootPage).not.toContain('components/landing/HomePage');
  });

  it("allows the imported premium homepage in the local development runtime", () => {
    expect(previewRoute).toContain('import PremiumHomepagePreview from "@/components/home-preview/ComingSoonPage"');
    expect(previewRoute).toContain("return <PremiumHomepagePreview />");
    expect(previewRoute).not.toContain("process.env.VERCEL_ENV");
  });

  it("returns notFound only in production and keeps the preview noindexed", () => {
    expect(previewRoute).toContain('if (process.env.NODE_ENV === "production") notFound();');
    expect(previewRoute).toContain("robots: { index: false, follow: false }");
  });

  it("does not redirect the local preview route to the public root", () => {
    expect(proxySource).toContain('const isComingSoonLaunch = process.env.NODE_ENV === "production"');
    expect(proxySource).not.toContain('"/home-preview",');
  });

  it("includes the complete isolated premium homepage source and required local imagery", () => {
    for (const file of [
      "PremiumHero.tsx",
      "TrustProofSection.tsx",
      "HowPetTapWorks.tsx",
      "InteractivePhoneExperience.tsx",
      "PremiumComparison.tsx",
      "CollectionsShowcase.tsx",
      "ProductShowcase.tsx",
      "PremiumFAQ.tsx",
      "FinalLaunchCTA.tsx",
    ]) {
      expect(existsSync(resolve(root, "components/home-preview", file))).toBe(true);
    }

    expect(existsSync(resolve(root, "public/images/home/pettap-hero-pets.webp"))).toBe(true);
    expect(existsSync(resolve(root, "public/images/how-it-works/step-06-safe-reunion.webp"))).toBe(true);
  });

  it("keeps preview-only waitlist CTAs and the premium navigation labels", () => {
    expect(heroSource).toContain("Join the Waitlist");
    expect(heroSource).toContain("Explore PetTap");
    expect(heroSource).toContain('href="#notify"');
    expect(heroSource).toContain('href="#how-it-works"');
    expect(navigationSource).toContain("How it works");
    expect(navigationSource).toContain("Collections");
    expect(navigationSource).toContain("FAQ");
    expect(navigationSource).toContain("Personalise your tag");
    expect(navigationSource).not.toContain(">About<");
    expect(navigationSource).not.toContain(">Contact<");
  });

  it("keeps the six-step story while applying the refined timeline copy and accessible interactions", () => {
    expect(timelineSource).toContain('title: "They tap your PetTap"');
    expect(timelineSource).toContain('title: "Your secure profile opens"');
    expect(timelineSource).toContain('title: "They reach you"');
    expect(timelineSource).toContain('title: "You’re safely reunited"');
    expect(timelineSource).toContain("whileHover={reducedMotion ? undefined");
    expect(timelineSource).toContain("whileFocus={reducedMotion ? undefined");
    expect(timelineSource).toContain("tabIndex={0}");
    expect(timelineSource).toContain("group-focus-within:scale-[1.035]");
  });
});
