export default function Hero() {
  return (
    <section className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="max-w-3xl text-center">
        <p className="text-blue-600 font-semibold">
          Smart Pet Recovery System
        </p>

        <h1 className="mt-4 text-5xl font-bold text-gray-900">
          Because every pet deserves a safe way home.
        </h1>

        <p className="mt-6 text-xl text-gray-500">
          PetTap helps reunite lost pets with their families using NFC technology and QR codes.
        </p>

        <div className="mt-10 flex justify-center gap-4">
          <button className="rounded-full bg-blue-600 px-8 py-4 text-white">
            Buy Now
          </button>

          <button className="rounded-full border border-gray-300 px-8 py-4">
            Learn More
          </button>
        </div>
      </div>
    </section>
  );
}