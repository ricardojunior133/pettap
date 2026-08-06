import type { Metadata } from "next";
import LegalPage from "@/components/legal/LegalPage";
import { LEGAL_DOCUMENTS } from "@/lib/legal/content";

export const metadata: Metadata = { title: "Shipping", description: "How a made-to-order PetTap will be prepared and delivered.", alternates: { canonical: "/shipping" } };
export default function ShippingPage() { return <LegalPage document={LEGAL_DOCUMENTS.shipping} />; }
