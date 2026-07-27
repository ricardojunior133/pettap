import Card from "@/components/ui/Card";

export default function AccountOrdersPage() {
  return (
    <section aria-labelledby="orders-heading">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">Orders</p>
      <h1 id="orders-heading" className="mt-3 text-4xl font-semibold tracking-[-0.06em]">Order history</h1>
      <Card variant="outlined" className="mt-8 p-7 sm:p-9"><h2 className="text-xl font-semibold tracking-[-0.04em]">Order history is not available yet</h2><p className="mt-3 max-w-xl text-sm leading-6 text-neutral-600">This account area is ready for the customer order experience. We have not connected it to unversioned commerce tables, so no order data is being simulated or exposed.</p></Card>
    </section>
  );
}
