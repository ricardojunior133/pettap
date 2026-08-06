import type { Metadata } from "next";
import Link from "next/link";

import LaunchFooter from "@/components/coming-soon/LaunchFooter";
import LaunchNavigation from "@/components/coming-soon/LaunchNavigation";
import Container from "@/components/layout/Container";
import { launchConfig } from "@/lib/launch/config";

export const metadata: Metadata = { title: "Contact", description: "Contact the PetTap team.", alternates: { canonical: "/contact" } };

export default function ContactPage() {
  return (
    <>
      <LaunchNavigation />
      <main className="bg-white pb-24 pt-36 sm:pb-32 sm:pt-44">
        <Container>
          <section className="mx-auto max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-neutral-500">Questions?</p>
            <h1 className="mt-5 text-4xl font-semibold tracking-[-0.05em] text-neutral-950 sm:text-6xl">We&apos;d love to hear from you.</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-neutral-600">Contact the PetTap team directly and we will respond as soon as we can.</p>
            <div className="mt-12 rounded-[28px] border border-black/[0.07] bg-neutral-50 p-6 sm:p-8">
              <h2 className="text-xl font-semibold tracking-[-0.03em] text-neutral-950">Email PetTap</h2>
              <p className="mt-3 text-sm leading-6 text-neutral-600">For product and launch questions, email us at:</p>
              <a href={`mailto:${launchConfig.contactEmail}`} className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-neutral-950 px-5 text-sm font-semibold text-white transition hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-neutral-950/15">{launchConfig.contactEmail}</a>
              <Link href="/" className="mt-4 inline-flex min-h-11 items-center rounded-xl border border-black/[0.10] px-5 text-sm font-semibold text-neutral-900 transition hover:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-neutral-950/15">Return to PetTap</Link>
            </div>
          </section>
        </Container>
      </main>
      <LaunchFooter />
    </>
  );
}
