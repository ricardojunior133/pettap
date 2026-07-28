export default function AccountNotificationsLoading() {
  return (
    <section aria-busy="true" aria-label="Loading order updates">
      <div className="h-3 w-28 animate-pulse rounded bg-neutral-200" />
      <div className="mt-4 h-10 w-72 max-w-full animate-pulse rounded bg-neutral-200" />
      <div className="mt-8 space-y-3">
        {[0, 1, 2].map((item) => <div key={item} className="h-28 animate-pulse rounded-3xl bg-white" />)}
      </div>
    </section>
  );
}
