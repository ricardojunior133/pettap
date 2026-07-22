import type { Metadata } from "next";
import ComingSoonPage from "@/components/coming-soon/ComingSoonPage";

export const metadata: Metadata = { title: "PetTap | Coming Soon", description: "Premium NFC Pet Tags. Launching soon in the UK.", alternates: { canonical: "/" }, openGraph: { title: "PetTap | Coming Soon", description: "Premium NFC Pet Tags. Launching soon in the UK." }, twitter: { card: "summary_large_image", title: "PetTap | Coming Soon", description: "Premium NFC Pet Tags. Launching soon in the UK." } };
export default function Home() { return <ComingSoonPage />; }
