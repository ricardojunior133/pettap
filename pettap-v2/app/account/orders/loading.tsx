import Card from "@/components/ui/Card";

export default function AccountOrdersLoading() {
  return (
    <section aria-busy="true" aria-label="Loading orders">
      <div className="h-3 w-16 animate-pulse rounded bg-neutral-200" />
      <div className="mt-4 h-10 w-56 animate-pulse rounded-xl bg-neutral-200" />
      <div className="mt-8 space-y-3">
        {[0, 1, 2].map((item) => <Card key={item} variant="outlined" className="h-28 animate-pulse bg-neutral-100" />)}
      </div>
    </section>
  );
}
