import type { Metadata } from "next";

import Studio from "@/components/studio/Studio";
import { resolveStudioInitialConfiguration } from "@/lib/studio/collection-query";

export const metadata: Metadata = {
  title: "PetTap Studio | Personalise your PetTap",
  description: "Explore a local, live PetTap configuration before checkout is introduced.",
  robots: { index: false, follow: false },
};

export default async function StudioPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const parameters = await searchParams;

  return <Studio initialConfiguration={resolveStudioInitialConfiguration(parameters)} />;
}
