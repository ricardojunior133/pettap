import type { Metadata } from "next";
import HomePage from "@/components/landing/HomePage";

export const metadata: Metadata = { title: "PetTap preview", description: "Private preview of the PetTap marketing website.", robots: { index: false, follow: false } };
export default function PreviewPage() { return <HomePage />; }
