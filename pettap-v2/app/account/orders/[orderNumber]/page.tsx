import Link from "next/link";

import Card from "@/components/ui/Card";

export default async function AccountOrderDetailPage({ params }: { params: Promise<{ orderNumber: string }> }) {
  await params;
  return (
    <section aria-labelledby="order-heading">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">Orders</p>
      <h1 id="order-heading" className="mt-3 text-4xl font-semibold tracking-[-0.06em]">Order details</h1>
      <Card variant="outlined" className="mt-8 p-7 sm:p-9"><h2 className="text-xl font-semibold tracking-[-0.04em]">This order cannot be displayed yet</h2><p className="mt-3 max-w-xl text-sm leading-6 text-neutral-600">Order ownership cannot be verified until the compatible commerce schema and repository are versioned in this branch.</p><Link className="mt-5 inline-flex text-sm font-semibold underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950" href="/account/orders">Back to orders</Link></Card>
    </section>
  );
}
