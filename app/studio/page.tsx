import Studio from "@/components/configurator/Studio";

export default function StudioPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-16">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold">
          PetTap Studio
        </h1>

        <p className="text-gray-500 mt-4">
          Design the perfect tag for your best friend.
        </p>
      </div>

      <Studio />
    </main>
  );
}