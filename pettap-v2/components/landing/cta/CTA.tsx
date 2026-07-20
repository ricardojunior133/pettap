"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";

import Container from "@/components/layout/Container";
import { FadeUp } from "@/components/animations";
import { Button } from "@/components/ui/button";

export default function CTA() {
  return (
    <section className="relative overflow-hidden py-36">

      {/* Background */}

      <div className="absolute inset-0 -z-10">

        <div className="absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-500/10 blur-[180px]" />

        <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-violet-500/10 blur-[160px]" />

      </div>

      <Container>

        <FadeUp>

          <div
            className="
              relative
              overflow-hidden
              rounded-[40px]
              border
              border-neutral-200/70
              bg-white/80
              px-8
              py-20
              text-center
              shadow-[0_30px_80px_rgba(0,0,0,.08)]
              backdrop-blur-xl
              lg:px-20
            "
          >
            {/* Glow */}

            <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-transparent to-violet-50 opacity-80" />

            <div className="relative">

              <div className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-sky-50 px-5 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-sky-700">

                <Sparkles className="h-4 w-4" />

                Ready to Start?

              </div>

              <h2 className="mx-auto mt-8 max-w-4xl font-heading text-5xl font-bold tracking-tight text-foreground lg:text-7xl">

                Give your best friend
                <br />
                a smarter way home.

              </h2>

              <p className="mx-auto mt-8 max-w-2xl text-xl leading-9 text-muted-foreground">

                Create a personalised PetTap in just a few minutes and
                help your pet get home faster if they ever become lost.

              </p>

              <div className="mt-12 flex flex-wrap justify-center gap-5">

                <Link href="/shop">

                  <Button
                    size="lg"
                    className="h-14 rounded-2xl px-10 text-base"
                  >
                    Create My PetTap

                    <ArrowRight className="ml-2 h-5 w-5" />

                  </Button>

                </Link>

                <Link href="#how-it-works">

                  <Button
                    variant="outline"
                    size="lg"
                    className="h-14 rounded-2xl px-10 text-base"
                  >
                    Learn More
                  </Button>

                </Link>

              </div>

              <div className="mt-14 flex flex-wrap items-center justify-center gap-8 text-sm font-medium text-muted-foreground">

                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-sky-600" />
                  No Subscription
                </div>

                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-sky-600" />
                  Works with iPhone & Android
                </div>

                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-sky-600" />
                  Waterproof
                </div>

              </div>

            </div>

          </div>

        </FadeUp>

      </Container>

    </section>
  );
}