export default function EventDemoProfileLoading() {
  return (
    <main aria-busy="true" aria-label="Loading pet profile" className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-14">
      <div className="animate-pulse space-y-6">
        <div className="h-5 w-32 rounded-full bg-neutral-200" />
        <div className="h-11 w-4/5 max-w-lg rounded-2xl bg-neutral-200" />
        <div className="h-5 w-3/5 max-w-md rounded-xl bg-neutral-100" />
        <div className="aspect-video rounded-[28px] bg-neutral-200 shadow-sm" />
        <div className="h-40 rounded-[28px] bg-neutral-100" />
        <div className="h-36 rounded-[28px] bg-neutral-100" />
      </div>
      <span className="sr-only">Loading the pet profile</span>
    </main>
  );
}
