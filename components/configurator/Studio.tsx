"use client";

import { useState } from "react";

import CollectionSelector from "./CollectionSelector";
import LivePreview from "./LivePreview";
import PetNameInput from "./PetNameInput";

export default function Studio() {
  const [selectedShape, setSelectedShape] = useState("");
  const [petName, setPetName] = useState("");

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 p-8">
      <div>
        <PetNameInput
          value={petName}
          onChange={setPetName}
        />

        <CollectionSelector
          selectedShape={selectedShape}
          onSelectShape={setSelectedShape}
        />
      </div>

      <LivePreview
        shapeName={selectedShape}
        petName={petName}
      />
    </div>
  );
}