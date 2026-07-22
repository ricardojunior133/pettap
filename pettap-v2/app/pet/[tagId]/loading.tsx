export default function LoadingRescueProfile() {
  return (
    <main className="min-h-screen bg-[#F6F7F8] py-4 sm:py-8" aria-busy="true" aria-label="Loading PetTap Rescue profile">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="overflow-hidden rounded-[30px] bg-white shadow-[0_24px_70px_rgba(0,0,0,.10)] sm:rounded-[40px]">
          <div className="h-[430px] animate-pulse bg-neutral-200 sm:h-[500px]" />
          <div className="space-y-5 px-5 py-8 sm:px-9">
            <div className="h-8 w-2/3 animate-pulse rounded-lg bg-neutral-200" />
            <div className="h-16 animate-pulse rounded-2xl bg-neutral-100" />
            <div className="h-16 animate-pulse rounded-2xl bg-neutral-100" />
          </div>
        </div>
      </div>
    </main>
  );
}
