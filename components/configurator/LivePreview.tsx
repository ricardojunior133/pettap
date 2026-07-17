interface LivePreviewProps {
  shapeName: string;
}

export default function LivePreview({
  shapeName,
}: LivePreviewProps) {
  return (
    <div className="sticky top-8">
      <div className="rounded-3xl border border-gray-200 bg-white shadow-lg p-10">
        <h2 className="text-2xl font-bold mb-8">
          Live Preview
        </h2>

        <div className="aspect-square rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center">
          <div className="text-5xl mb-4">🐾</div>

          <h3 className="text-2xl font-bold">
            {shapeName || "Choose a shape"}
          </h3>

          <p className="mt-4 text-gray-500">
            Charlie
          </p>
        </div>
      </div>
    </div>
  );
}