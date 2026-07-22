import type { Metadata } from "next";
import { notFound } from "next/navigation";

import RescueProfile from "@/components/rescue/RescueProfile";
import { getRescueProfileByTagId, getRescueTagIds } from "@/features/rescue";

export const metadata: Metadata = {
  title: "PetTap Rescue",
  robots: {
    index: false,
    follow: false,
  },
};

export function generateStaticParams() {
  return getRescueTagIds().map((tagId) => ({ tagId }));
}

export default async function RescuePage({ params }: { params: Promise<{ tagId: string }> }) {
  const { tagId } = await params;
  const profile = await getRescueProfileByTagId(tagId);

  if (!profile) {
    notFound();
  }

  return <RescueProfile profile={profile} />;
}
