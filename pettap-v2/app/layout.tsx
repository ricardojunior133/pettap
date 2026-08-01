import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PetTap | Smart NFC Pet Tags",
  description: "Personalised NFC pet tags designed to help lost pets get home safely.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
