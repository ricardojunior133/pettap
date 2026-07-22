import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

import Container from "@/components/layout/Container";
import { TAG_SIZES } from "@/lib/sizes";
import { TAG_SPEC } from "@/lib/tag-spec";
import { getPriceForSize } from "@/src/lib/domain/tag";

export default function SizeGuide() {
  return (
    <section id="sizes" className="scroll-mt-24 bg-neutral-50/75 py-24 sm:py-32">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-neutral-500">Find the right fit</p>
          <h2 className="mt-5 text-4xl font-semibold tracking-[-0.05em] text-neutral-950 sm:text-5xl">Sized for the way they move.</h2>
          <p className="mt-5 text-base leading-7 text-neutral-600">A considered fit keeps your PetTag comfortable, visible and ready for every walk.</p>
        </div>
        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          {TAG_SIZES.map((size) => {
            const spec = TAG_SPEC[size.id];
            return <article key={size.id} className="rounded-[28px] border border-black/[0.07] bg-white p-6 shadow-[0_14px_38px_rgba(17,17,17,0.04)] sm:p-7">
              <div className="flex items-start justify-between gap-4"><div><p className="text-2xl font-semibold tracking-[-0.04em] text-neutral-950">{size.title}</p><p className="mt-2 text-sm leading-6 text-neutral-600">{size.description}</p></div><span className="text-xl font-semibold tracking-[-0.04em] text-neutral-950">£{getPriceForSize(size.id).toFixed(2)}</span></div>
              <div className="mt-7 rounded-2xl bg-neutral-50 p-5"><div className="flex h-16 items-center justify-center"><span className="rounded-full bg-neutral-900 shadow-[0_9px_12px_rgba(17,17,17,0.18)]" style={{ height: `${spec.diameter * 1.55}px`, width: `${spec.diameter * 1.55}px` }} /></div><p className="mt-4 text-center text-xs font-medium text-neutral-500">{spec.diameter} mm diameter · {spec.holeDiameter} mm ring hole</p></div>
              <div className="mt-6 min-h-12">{size.recommendedFor ? <><p className="text-xs font-semibold uppercase tracking-[0.15em] text-neutral-400">Recommended for</p><p className="mt-2 text-sm text-neutral-700">{size.recommendedFor.join(" · ")}</p></> : <p className="flex items-center gap-2 text-sm text-neutral-700"><Check className="size-4" aria-hidden="true" /> A balanced fit for most breeds.</p>}</div>
            </article>;
          })}
        </div>
        <div className="mt-10 text-center"><Link href="/studio" className="inline-flex items-center gap-2 rounded-2xl bg-neutral-950 px-6 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-neutral-900/15">Choose your size in the Studio <ArrowRight className="size-4" aria-hidden="true" /></Link></div>
      </Container>
    </section>
  );
}
