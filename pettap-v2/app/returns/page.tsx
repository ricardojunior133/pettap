import type { Metadata } from "next";
import LegalPage from "@/components/legal/LegalPage";
import { LEGAL_DOCUMENTS } from "@/lib/legal/content";

export const metadata: Metadata = { title: "Returns", description: "Returns information for PetTap when orders become available." };
export default function ReturnsPage() { return <LegalPage document={LEGAL_DOCUMENTS.returns} />; }
