"use client";

export default function AccountOrderDetailError({ unstable_retry }: { error: Error & { digest?: string }; unstable_retry: () => void }) {
  return (
    <section aria-labelledby="order-error-heading">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">Orders</p>
      <div className="mt-5 rounded-3xl border border-black/[0.09] bg-white p-7 sm:p-9">
        <h1 id="order-error-heading" className="text-2xl font-semibold tracking-[-0.04em]">We couldn&apos;t load this order.</h1>
        <p className="mt-3 text-sm leading-6 text-neutral-600">Please try again. If the problem continues, contact PetTap support.</p>
        <button className="mt-6 inline-flex min-h-11 items-center rounded-full bg-neutral-950 px-5 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2" type="button" onClick={unstable_retry}>
          Try again
        </button>
      </div>
    </section>
  );
}
