import type { Metadata } from "next";
import LegalPage from "@/components/legal/LegalPage";
import { LEGAL_DOCUMENTS } from "@/lib/legal/content";

export const metadata: Metadata = { title: "Privacy policy", description: "Information about personal data on PetTap's Coming Soon website.", alternates: { canonical: "/privacy" } };
export default function PrivacyPage() { return <LegalPage document={LEGAL_DOCUMENTS.privacy} />; }
