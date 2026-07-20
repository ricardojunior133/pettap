export default function StudioWorkspace() {
  return (
    <div className="rounded-[40px] border border-neutral-200 bg-white p-10 shadow-sm">
      <span className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
        Step One
      </span>

      <h2 className="mt-5 text-4xl font-bold tracking-tight">
        Choose a size.
      </h2>

      <p className="mt-4 text-lg text-neutral-500">
        Select the size that best suits your pet.
      </p>

      <div className="mt-12 space-y-4">
        <button className="w-full rounded-2xl border-2 border-primary p-5 text-left transition hover:shadow-md">
          <h3 className="font-semibold">Classic</h3>

          <p className="mt-1 text-sm text-neutral-500">
            Perfect for most cats and dogs.
          </p>
        </button>

        <button className="w-full rounded-2xl border border-neutral-200 p-5 text-left transition hover:border-black">
          <h3 className="font-semibold">Petite</h3>

          <p className="mt-1 text-sm text-neutral-500">
            Ideal for small breeds.
          </p>
        </button>

        <button className="w-full rounded-2xl border border-neutral-200 p-5 text-left transition hover:border-black">
          <h3 className="font-semibold">Explorer</h3>

          <p className="mt-1 text-sm text-neutral-500">
            Designed for larger breeds.
          </p>
        </button>
      </div>

      <button className="mt-10 w-full rounded-2xl bg-black py-4 text-lg font-medium text-white transition hover:opacity-90">
        Continue
      </button>
    </div>
  );
}