import type { Metadata } from "next";
import "./globals.css";

import { siteConfig } from "@/lib/config/site";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),

  title: {
    default: "PetTap",
    template: "%s | PetTap",
  },

  description: siteConfig.description,

  keywords: [
    "NFC Pet Tag",
    "Smart Pet Tag",
    "Dog Tag",
    "Cat Tag",
    "Lost Pet",
    "PetTap",
    "Pet Safety",
    "Pet ID Tag",
  ],

  authors: [
    {
      name: siteConfig.name,
    },
  ],

  creator: siteConfig.name,

  applicationName: siteConfig.name,

  alternates: {
    canonical: "/",
  },

  openGraph: {
    title: siteConfig.name,

    description:
      "Beautiful NFC pet tags that help reunite lost pets with their families.",

    type: "website",

    locale: "en_GB",

    siteName: siteConfig.name,
    url: siteConfig.url,
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "PetTap premium NFC pet tags" }],

  },

  twitter: {
    card: "summary_large_image",

    title: "PetTap",

    description:
      "Beautiful NFC pet tags that help lost pets find their way home.",
    images: ["/opengraph-image"],

  },

  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html lang="en">
      <body className="min-h-screen bg-white text-[#111111] antialiased">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "Organization", name: siteConfig.name, url: siteConfig.url, email: siteConfig.contactEmail, description: siteConfig.description }) }} />
        {children}
      </body>
    </html>
  );
}
