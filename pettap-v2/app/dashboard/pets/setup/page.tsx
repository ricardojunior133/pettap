import type { Metadata } from "next";

import WizardLayout from "@/components/pet-setup/WizardLayout";
import { mockPetSetup } from "@/lib/pet-setup";

export const metadata: Metadata = { title: "Pet setup", description: "Complete your PetTap pet profile in a few guided steps.", robots: { index: false, follow: false } };

export default function PetSetupPage() { return <WizardLayout data={mockPetSetup} />; }
