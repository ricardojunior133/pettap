import Hero from "./hero/Hero";
import TrustBar from "./trust-bar/TrustBar";
import WhyPetTap from "./why-pettap/WhyPetTap";
import PhonePreview from "./phone-preview/PhonePreview";
import HowItWorks from "./how-it-works/HowItWorks";
import ChooseStyle from "./choose-style/ChooseStyle";
import CTA from "./cta/CTA";

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustBar />
      <WhyPetTap />
      <PhonePreview />
      <HowItWorks />
      <ChooseStyle />
      <CTA />
    </>
  );
}