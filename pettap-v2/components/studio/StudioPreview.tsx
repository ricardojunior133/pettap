export default function StudioPreview() {
  return (
    <div className="sticky top-24">
      <div className="rounded-[40px] border border-neutral-200 bg-gradient-to-b from-white to-neutral-100 p-10 shadow-xl">
        <div className="flex aspect-square items-center justify-center rounded-3xl bg-white">
          <div className="text-center">
            <p className="text-sm uppercase tracking-[0.3em] text-neutral-400">
              Preview
            </p>

            <h2 className="mt-4 text-3xl font-semibold">
              Your PetTap
            </h2>

            <p className="mt-3 text-neutral-500">
              Your personalised design will appear here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}