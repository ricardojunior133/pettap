import Container from "@/components/layout/Container";
import StorySection from "./StorySection";

export default function HowItWorks() {
  return (
    <section className="bg-white py-32">
      <Container>
        <div className="mx-auto mb-24 max-w-3xl text-center">
          <span className="text-sm font-semibold uppercase tracking-[0.35em] text-primary">
            HOW IT WORKS
          </span>

          <h2 className="mt-6 text-5xl font-bold tracking-tight text-slate-900 lg:text-6xl">
            One simple tap can change everything.
          </h2>

          <p className="mt-8 text-xl leading-9 text-slate-600">
            From the moment your pet goes missing until they're safely back in
            your arms, PetTap makes every second count.
          </p>
        </div>

        <StorySection
          eyebrow="01 • LOST"
          title="If your pet gets lost, PetTap is already working."
          description="Your pet keeps wearing the tag, waiting for someone kind enough to help."
          image="/images/story/lost.png"
        />

        <StorySection
          reverse
          eyebrow="02 • TAP"
          title="One tap. No apps. No delays."
          description="Anyone with a modern smartphone can instantly access your pet's profile using NFC."
          image="/images/story/tap.png"
        />

        <StorySection
          eyebrow="03 • CONTACT"
          title="The finder contacts you in seconds."
          description="Your contact details are available immediately, making the reunion as fast as possible."
          image="/images/story/contact.png"
        />

        <StorySection
          reverse
          eyebrow="04 • HOME"
          title="Back where they belong."
          description="The best notification you'll ever receive is knowing your best friend is coming home."
          image="/images/story/home.png"
        />
      </Container>
    </section>
  );
}