import Card from "@/components/ui/Card";

export default function AccountOrderDetailLoading() {
  return (
    <section aria-busy="true" aria-label="Loading order details">
      <div className="h-11 w-28 animate-pulse rounded-full bg-neutral-100" />
      <div className="mt-5 h-3 w-14 animate-pulse rounded bg-neutral-200" />
      <div className="mt-3 h-11 w-56 animate-pulse rounded-xl bg-neutral-200" />
      <div className="mt-8 grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(18rem,0.8fr)]">
        <Card variant="outlined" className="h-96 animate-pulse bg-neutral-100" />
        <Card variant="outlined" className="h-64 animate-pulse bg-neutral-100" />
      </div>
    </section>
  );
}
