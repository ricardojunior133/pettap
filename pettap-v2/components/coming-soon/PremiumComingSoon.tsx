import { PawPrint } from "lucide-react";

const waitlistHref = "mailto:hello@pettap.co.uk?subject=PetTap%20waitlist";

export function PremiumComingSoon() {
  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[#fbfbfa] px-5 py-5 text-[#101114] sm:px-8 sm:py-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-[#f2e5d7]/70 blur-3xl sm:h-[42rem] sm:w-[42rem]"
      />
      <section className="mx-auto flex min-h-[calc(100vh-2.5rem)] max-w-6xl flex-col rounded-[28px] border border-black/[0.06] bg-white/90 px-6 py-7 shadow-[0_20px_80px_rgba(17,17,17,0.06)] backdrop-blur-sm sm:min-h-[calc(100vh-4rem)] sm:px-12 sm:py-10 lg:px-20 lg:py-14">
        <header className="flex items-center justify-between" aria-label="PetTap">
          <span className="inline-flex items-center gap-2 text-lg font-semibold tracking-[-0.04em] sm:text-xl">
            <PawPrint aria-hidden="true" className="size-6" strokeWidth={2.4} />
            <span>PetTap</span>
          </span>
          <span className="rounded-full border border-black/[0.09] bg-[#fafaf8] px-3 py-1.5 text-[10px] font-semibold tracking-[0.14em] text-neutral-600 sm:text-xs">COMING SOON</span>
        </header>

        <div className="flex flex-1 items-center py-16 sm:py-20 lg:py-24">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold tracking-[0.2em] text-neutral-500">PETTAP</p>
            <p className="mt-5 text-sm font-semibold tracking-[0.18em] text-[#b95f14]">COMING SOON</p>
            <h1 className="mt-6 max-w-2xl text-5xl font-semibold leading-[0.98] tracking-[-0.065em] sm:text-6xl lg:text-8xl">
              Smart protection for the pets you love.
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-neutral-600 sm:text-xl">
              Personalised NFC pet tags designed to help lost pets get home safely — with one simple tap.
            </p>
            <a className="mt-10 inline-flex min-h-12 items-center justify-center rounded-full bg-[#161718] px-6 text-sm font-semibold text-white transition hover:bg-[#303134] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#161718]" href={waitlistHref}>
              Join the waitlist
            </a>
            <p className="mt-7 text-sm leading-6 text-neutral-500">No subscription. No app required. Built for pet owners in the UK.</p>
          </div>
        </div>

        <footer className="border-t border-black/[0.07] pt-6 text-sm text-neutral-500 sm:flex sm:items-center sm:justify-between">
          <p>Because every pet deserves a safe way home.</p>
          <p className="mt-2 sm:mt-0">© PetTap</p>
        </footer>
      </section>
    </main>
  );
}
