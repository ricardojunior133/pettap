import type { Metadata } from "next";
import { notFound } from "next/navigation";

import PremiumHomepagePreview from "@/components/home-preview/ComingSoonPage";

export const metadata: Metadata = {
  title: "PetTap homepage preview",
  robots: { index: false, follow: false },
};

/** Local-only review route. Production remains on the approved Coming Soon page. */
export default function HomePreviewPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return <PremiumHomepagePreview />;
}
