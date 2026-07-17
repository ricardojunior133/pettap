export default function Navbar() {
  return (
    <header className="w-full border-b border-gray-100">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">

        <div className="flex items-center gap-3">
          <span className="text-3xl">🐾</span>

          <div>
            <h1 className="text-xl font-bold text-gray-900">
              PetTap
            </h1>

            <p className="text-xs text-gray-500">
              Smart Pet Recovery System
            </p>
          </div>
        </div>

        <button className="rounded-full bg-blue-600 px-6 py-3 text-white transition hover:bg-blue-700">
          Buy Now
        </button>

      </div>
    </header>
  );
}