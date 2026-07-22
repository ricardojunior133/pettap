import type { Metadata } from "next";

import ActivationFlow from "@/components/activation/ActivationFlow";
import { mockActivation } from "@/lib/activation";

export const metadata: Metadata = { title: "Activate PetTap", description: "Activate a new PetTap in a few calm, guided steps.", robots: { index: false, follow: false } };

export default function ActivationPage() {
  return <ActivationFlow data={mockActivation} />;
}
