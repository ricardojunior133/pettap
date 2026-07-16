export default function Home() {
  return (
    <main className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center max-w-xl px-6">

        <h1 className="text-6xl font-bold text-blue-600">
          🐾 PetTap
        </h1>

        <p className="text-2xl mt-6 text-gray-800">
          Keep your pet safe.
        </p>

        <p className="mt-4 text-gray-500">
          The smart NFC tag that helps lost pets find their way home.
        </p>

        <button className="mt-10 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full text-lg">
          Coming Soon
        </button>

      </div>
    </main>
  );
}