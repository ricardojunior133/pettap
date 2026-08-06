import type { Metadata } from "next";
import LegalPage from "@/components/legal/LegalPage";
import { LEGAL_DOCUMENTS } from "@/lib/legal/content";

export const metadata: Metadata = { title: "Terms & conditions", description: "Information about the PetTap Coming Soon website and future product service.", alternates: { canonical: "/terms" } };
export default function TermsPage() { return <LegalPage document={LEGAL_DOCUMENTS.terms} />; }
