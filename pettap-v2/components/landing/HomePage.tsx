import Hero from "./hero/Hero";
import TrustBar from "./trust-bar/TrustBar";
import HowItWorks from "./how-it-works/HowItWorks";
import ProductDetails from "./product-details/ProductDetails";
import TagLibrary from "./tag-library/TagLibrary";
import CTA from "./cta/CTA";
import Navbar from "@/components/layout/Navbar";
import Footer from "./footer/Footer";

export default function HomePage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "PetTap",
    url: "https://pettap.co.uk",
    description: "Beautiful NFC pet tags that help lost pets find their way home in seconds.",
    knowsAbout: ["NFC pet tags", "pet safety", "pet profiles"],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <Navbar />
      <main className="overflow-x-clip">
        <Hero />
        <TrustBar />
        <HowItWorks />
        <TagLibrary />
        <ProductDetails />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
