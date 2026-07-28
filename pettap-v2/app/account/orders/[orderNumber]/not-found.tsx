import Link from "next/link";

import Card from "@/components/ui/Card";

export default function AccountOrderNotFound() {
  return (
    <section aria-labelledby="order-not-found-heading">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">Orders</p>
      <Card variant="outlined" className="mt-5 p-7 sm:p-9">
        <h1 id="order-not-found-heading" className="text-2xl font-semibold tracking-[-0.04em]">We couldn&apos;t find that order.</h1>
        <p className="mt-3 max-w-lg text-sm leading-6 text-neutral-600">Check the order number or return to your order history.</p>
        <Link className="mt-6 inline-flex min-h-11 items-center rounded-full bg-neutral-950 px-5 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2" href="/account/orders">
          Back to orders
        </Link>
      </Card>
    </section>
  );
}
