interface ShapeCardProps {
  shape: {
    id: string;
    name: string;
    tagline: string;
    description: string;
  };
  selected: boolean;
  onSelect: () => void;
}

export default function ShapeCard({
  shape,
  selected,
  onSelect,
}: ShapeCardProps) {
  return (
    <div
      onClick={onSelect}
      className={`rounded-2xl border p-6 cursor-pointer transition-all duration-200 ${
        selected
          ? "border-blue-600 shadow-lg ring-2 ring-blue-200"
          : "border-gray-200 hover:shadow-md"
      }`}
    >
      <h3 className="text-xl font-semibold">
        {shape.name}
      </h3>

      <p className="text-sm text-gray-500 mt-1">
        {shape.tagline}
      </p>

      <p className="mt-4 text-gray-700">
        {shape.description}
      </p>

      {selected && (
        <div className="mt-6 text-blue-600 font-semibold">
          ✓ Selected
        </div>
      )}
    </div>
  );
}