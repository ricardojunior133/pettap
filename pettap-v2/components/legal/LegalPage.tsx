import type { LegalDocument } from "@/lib/legal/content";

import Container from "@/components/layout/Container";
import LaunchFooter from "@/components/coming-soon/LaunchFooter";
import LaunchNavigation from "@/components/coming-soon/LaunchNavigation";

export default function LegalPage({ document }: { document: LegalDocument }) {
  return (
    <>
      <LaunchNavigation />
      <main className="bg-white pb-24 pt-36 sm:pb-32 sm:pt-44">
        <Container>
          <article className="mx-auto max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-neutral-500">PetTap information</p>
            <h1 className="mt-5 text-4xl font-semibold tracking-[-0.05em] text-neutral-950 sm:text-6xl">{document.title}</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-neutral-600">{document.summary}</p>
            <p className="mt-5 text-sm text-neutral-400">Status: {document.updated}</p>

            <div className="mt-14 space-y-12">
              {document.sections.map((section) => (
                <section key={section.title}>
                  <h2 className="text-2xl font-semibold tracking-[-0.035em] text-neutral-950">{section.title}</h2>
                  <div className="mt-4 space-y-4 text-base leading-7 text-neutral-600">
                    {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                  </div>
                </section>
              ))}
            </div>
          </article>
        </Container>
      </main>
      <LaunchFooter />
    </>
  );
}
