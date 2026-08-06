export default function OrdersLoading() {
  return <div aria-hidden="true" className="animate-pulse space-y-6"><div className="h-28 max-w-xl rounded-3xl bg-neutral-200" /><div className="grid gap-4 lg:grid-cols-2">{Array.from({ length: 4 }, (_, index) => <div className="h-56 rounded-3xl bg-neutral-200" key={index} />)}</div></div>;
}
