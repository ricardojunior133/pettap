"use client";

import { useState } from "react";
import CollectionSelector from "./CollectionSelector";
import LivePreview from "./LivePreview";

export default function Studio() {
  const [selectedShape, setSelectedShape] = useState("");

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 p-8">
      <CollectionSelector
        selectedShape={selectedShape}
        onSelectShape={setSelectedShape}
      />

      <LivePreview
        shapeName={selectedShape}
      />
    </div>
  );
}