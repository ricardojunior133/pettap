import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";

import Container from "@/components/layout/Container";

export default function CTA() {
  return (
    <section className="bg-white py-24 sm:py-32">
      <Container>
        <div className="overflow-hidden rounded-[36px] bg-neutral-950 px-7 py-16 text-center text-white shadow-[0_24px_60px_rgba(17,17,17,0.16)] sm:px-12 sm:py-20">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/55">A calmer way to protect them</p>
          <h2 className="mx-auto mt-5 max-w-3xl text-4xl font-semibold tracking-[-0.055em] sm:text-6xl">Give them a safer way home.</h2>
          <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-white/65 sm:text-lg">Start with PetTap Essential, or make a PetTag that feels entirely theirs in the Studio.</p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link href="/checkout?product=essential" className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-white px-6 text-sm font-semibold text-neutral-950 transition hover:-translate-y-0.5 hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/25">Buy PetTap Essential <ArrowRight className="size-4" aria-hidden="true" /></Link>
            <Link href="/studio" className="inline-flex min-h-12 items-center gap-2 rounded-2xl border border-white/20 px-6 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/25">Explore the Studio</Link>
          </div>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-7 gap-y-3 text-sm text-white/60">
            <span className="inline-flex items-center gap-2"><ShieldCheck className="size-4" aria-hidden="true" />NFC enabled</span>
            <span className="inline-flex items-center gap-2"><ShieldCheck className="size-4" aria-hidden="true" />No subscription</span>
            <span className="inline-flex items-center gap-2"><ShieldCheck className="size-4" aria-hidden="true" />No app required</span>
          </div>
        </div>
      </Container>
    </section>
  );
}
