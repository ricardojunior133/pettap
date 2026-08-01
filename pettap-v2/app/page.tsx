import type { Metadata } from "next";

import { PremiumComingSoon } from "@/components/coming-soon/PremiumComingSoon";

export const metadata: Metadata = {
  title: "PetTap | Coming Soon",
  description: "Smart NFC pet tags designed to help lost pets get home safely.",
  alternates: { canonical: "/" },
};

export default function Home() {
  return <PremiumComingSoon />;
}
