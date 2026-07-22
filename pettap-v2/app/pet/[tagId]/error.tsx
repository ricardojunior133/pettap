"use client";

export default function RescueProfileError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex min-h-screen items-center bg-[#F6F7F8] px-4 py-8">
      <section className="mx-auto w-full max-w-md rounded-[30px] bg-white p-8 text-center shadow-[0_24px_70px_rgba(0,0,0,.10)] sm:p-10">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Unable to open this profile</h1>
        <p className="mt-3 leading-7 text-muted-foreground">Please try again. If the problem continues, contact PetTap support.</p>
        <button type="button" onClick={reset} className="mt-8 min-h-12 rounded-xl bg-neutral-900 px-5 text-sm font-semibold text-white transition-colors hover:bg-black focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-600">
          Try again
        </button>
      </section>
    </main>
  );
}
