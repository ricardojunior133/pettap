import Link from "next/link";
import Footer from "@/components/landing/footer/Footer";
import LaunchFooter from "@/components/coming-soon/LaunchFooter";
import LaunchNavigation from "@/components/coming-soon/LaunchNavigation";
import Navbar from "@/components/layout/Navbar";
import Container from "@/components/layout/Container";
import { isComingSoonLaunch } from "@/lib/launch/config";

export default function NotFound() {
  if (isComingSoonLaunch) {
    return (
      <>
        <LaunchNavigation />
        <main className="bg-white pb-24 pt-36 sm:pb-32 sm:pt-44">
          <Container>
            <section className="mx-auto max-w-2xl text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-neutral-500">404</p>
              <h1 className="mt-5 text-4xl font-semibold tracking-[-0.05em] text-neutral-950 sm:text-6xl">This page has wandered off.</h1>
              <p className="mx-auto mt-6 max-w-lg text-lg leading-8 text-neutral-600">The page you are looking for is not available, but PetTap is still preparing something special.</p>
              <Link href="/" className="mt-10 inline-flex min-h-12 items-center justify-center rounded-2xl bg-neutral-950 px-6 text-sm font-semibold text-white transition hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-neutral-950/15">Return home</Link>
            </section>
          </Container>
        </main>
        <LaunchFooter />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="bg-white pb-24 pt-36 sm:pb-32 sm:pt-44">
        <Container>
          <section className="mx-auto max-w-2xl text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-neutral-500">
              404
            </p>
            <h1 className="mt-5 text-4xl font-semibold tracking-[-0.05em] text-neutral-950 sm:text-6xl">
              This page has wandered off.
            </h1>
            <p className="mx-auto mt-6 max-w-lg text-lg leading-8 text-neutral-600">
              The page you are looking for is not here, but PetTap is still ready
              to help pets find their way home.
            </p>
            <Link
              href="/"
              className="mt-10 inline-flex min-h-12 items-center justify-center rounded-2xl bg-neutral-950 px-6 text-sm font-semibold text-white transition hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-neutral-950/15"
            >
              Return home
            </Link>
          </section>
        </Container>
      </main>
      <Footer />
    </>
  );
}
