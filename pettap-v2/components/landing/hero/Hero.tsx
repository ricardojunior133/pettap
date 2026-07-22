import Container from "@/components/layout/Container";
import { FadeUp } from "@/components/animations";

import HeroContent from "./HeroContent";
import HeroVisual from "./HeroVisual";

export default function Hero() {
  return (
    <section className="relative overflow-hidden py-16 lg:py-28">
      <Container>
        <div className="relative lg:min-h-[820px]">

          {/* Texto */}
          <div className="relative z-20 max-w-xl">
            <FadeUp>
              <HeroContent />
            </FadeUp>
          </div>

          <div className="relative z-10 mt-10 lg:hidden">
            <FadeUp delay={0.16}>
              <HeroVisual compact />
            </FadeUp>
          </div>

          {/* Cena */}
          <div className="absolute inset-y-0 right-[-10rem] hidden w-[900px] lg:block">
            <FadeUp delay={0.2}>
              <HeroVisual />
            </FadeUp>
          </div>

        </div>
      </Container>
    </section>
  );
}
