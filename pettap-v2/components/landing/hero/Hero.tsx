import Container from "@/components/layout/Container";
import { FadeUp } from "@/components/animations";

import HeroContent from "./HeroContent";
import HeroVisual from "./HeroVisual";

export default function Hero() {
  return (
    <section className="relative overflow-hidden py-20 lg:py-28">
      <Container>
        <div className="relative min-h-[820px]">

          {/* Texto */}
          <div className="relative z-20 max-w-xl">
            <FadeUp>
              <HeroContent />
            </FadeUp>
          </div>

          {/* Cena */}
          <div className="absolute inset-y-0 right-[-8rem] hidden w-[900px] lg:block">
            <FadeUp delay={0.2}>
              <HeroVisual />
            </FadeUp>
          </div>

        </div>
      </Container>
    </section>
  );
}