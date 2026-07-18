import TagPreview from "./TagPreview";

interface LivePreviewProps {
  shapeName: string;
  petName: string;
}

export default function LivePreview({
  shapeName,
  petName,
}: LivePreviewProps) {
  return (
    <div className="sticky top-8">
      <div className="rounded-3xl border border-gray-200 bg-white shadow-lg p-10">
        <h2 className="text-2xl font-bold mb-8">
          Live Preview
        </h2>

        <div className="aspect-square rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-6">
          <TagPreview
  petName={petName}
  shapeName={shapeName}
/>

          
        </div>
      </div>
    </div>
  );
}