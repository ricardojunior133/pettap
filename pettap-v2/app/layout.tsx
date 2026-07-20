import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://pettap.co.uk"),

  title: {
    default: "PetTap",
    template: "%s | PetTap",
  },

  description:
    "Beautiful NFC pet tags that help lost pets find their way home in seconds.",

  keywords: [
    "NFC Pet Tag",
    "Smart Pet Tag",
    "QR Pet Tag",
    "Dog Tag",
    "Cat Tag",
    "Lost Pet",
    "PetTap",
    "Pet Safety",
    "Pet ID Tag",
  ],

  authors: [
    {
      name: "PetTap",
    },
  ],

  creator: "PetTap",

  applicationName: "PetTap",

  openGraph: {
    title: "PetTap",

    description:
      "Beautiful NFC pet tags that help reunite lost pets with their families.",

    type: "website",

    locale: "en_GB",

    siteName: "PetTap",

    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "PetTap",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",

    title: "PetTap",

    description:
      "Beautiful NFC pet tags that help lost pets find their way home.",

    images: ["/og-image.jpg"],
  },

  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-white text-[#111111] antialiased">
        {children}
      </body>
    </html>
  );
}