"use client";

import { collections } from "@/lib/data/collections";
import ShapeCard from "./ShapeCard";

interface CollectionSelectorProps {
  selectedShape: string;
  onSelectShape: (shapeId: string) => void;
}

export default function CollectionSelector({
  selectedShape,
  onSelectShape,
}: CollectionSelectorProps) {
  return (
    <div>
      {collections.map((collection) => (
        <section key={collection.id} className="mb-12">
          <h2 className="text-3xl font-bold">
            {collection.name}
          </h2>

          <p className="text-gray-500 mb-8">
            {collection.description}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {collection.shapes.map((shape) => (
              <ShapeCard
                key={shape.id}
                shape={shape}
                selected={selectedShape === shape.id}
                onSelect={() => onSelectShape(shape.id)}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}