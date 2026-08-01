import type { Metadata } from "next";

import HomePage from "@/components/landing/HomePage";

export const metadata: Metadata = {
  title: "PetTap | Smart NFC Pet Tags",
  description: "Personalised NFC pet tags designed to help lost pets get home safely.",
  alternates: { canonical: "/" },
};

export default function Home() {
  return <HomePage />;
}
