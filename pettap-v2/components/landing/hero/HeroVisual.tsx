"use client";

import Image from "next/image";
import { Float } from "@/components/animations";

export default function HeroVisual() {
  return (
    <div className="relative h-[820px] w-[900px]">

      {/* Background Glow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-[760px] w-[760px] rounded-full bg-violet-500/15 blur-[180px]" />
      </div>

      {/* Ground Shadow */}
      <div className="absolute bottom-2 left-[58%] z-10 -translate-x-1/2">
        <div className="h-10 w-[540px] rounded-full bg-black/15 blur-3xl" />
      </div>

      {/* Golden */}
<div className="absolute left-[35%] top-20 z-40 translate-x-[220px]">
  <Float duration={8}>
    <Image
      src="/images/hero/golden.png"
      alt="Golden Retriever"
      width={980}
      height={980}
      priority
      className="drop-shadow-[0_40px_90px_rgba(0,0,0,.25)]"
    />
  </Float>
</div>

      {/* Phone */}
      <div className="absolute left-[40%] top-10 translate-x-[180px]">
        <Float duration={6}>
          <Image
            src="/images/hero/phone.png"
            alt="PetTap App"
            width={430}
            height={640}
            priority
            className="rotate-[10deg] drop-shadow-[0_40px_90px_rgba(0,0,0,.30)]"
          />
        </Float>
      </div>

      {/* Pug */}
      <div className="absolute bottom-12 left-[20%] z-30">
        <Float duration={7}>
          <Image
            src="/images/hero/pug.png"
            alt="Pug"
            width={150}
            height={230}
            priority
            className="drop-shadow-[0_20px_40px_rgba(0,0,0,.20)]"
          />
        </Float>
      </div>

      {/* Cat */}
      <div className="absolute bottom-8 left-[58%] z-30">
        <Float duration={9}>
          <Image
            src="/images/hero/cat.png"
            alt="British Shorthair"
            width={250}
            height={210}
            priority
            className="drop-shadow-[0_20px_40px_rgba(0,0,0,.20)]"
          />
        </Float>
      </div>

      {/* Reviews Card */}
      <div className="absolute left-[46%] top-24 z-50 rounded-3xl border border-white/60 bg-white/90 p-5 shadow-2xl backdrop-blur-xl">
        <p className="text-lg text-yellow-500">★★★★★</p>

        <p className="mt-2 text-[10px] uppercase tracking-[0.25em] text-gray-500">
          Trusted by
        </p>

        <p className="text-3xl font-bold text-slate-900">
          5,000+
        </p>

        <p className="text-sm text-gray-500">
          Pet Parents
        </p>
      </div>

      {/* Subscription Card */}
      <div className="absolute28 right-0 z-50 rounded-3xl border border-white/60 bg-white/90 p-6 shadow-2xl backdrop-blur-xl">
        <p className="text-4xl font-bold text-primary">
          100%
        </p>

        <p className="text-xs uppercase tracking-[0.25em] text-gray-500">
          Subscription
        </p>

        <p className="font-semibold">
          Free
        </p>
      </div>
    </div>
  );
}