"use client";

import { useMemo, useState } from "react";

import ColorPicker from "./ColorPicker";
import FeatureBadges from "./FeatureBadges";
import TagPreview from "./TagPreview";
import { TAG_VARIANTS, TagColor } from "./colors";

export default function ChooseStyle() {
  const [selectedColor, setSelectedColor] =
    useState<TagColor>("black");

  const selectedVariant = useMemo(
    () =>
      TAG_VARIANTS.find(
        (variant) => variant.id === selectedColor
      )!,
    [selectedColor]
  );

  return (
    <section className="py-40">
      <div className="mx-auto max-w-7xl px-6">

        <div className="mx-auto mb-20 max-w-3xl text-center">

          <span className="text-sm font-semibold uppercase tracking-[0.35em] text-primary">
            Choose Your Style
          </span>

          <h2 className="mt-6 text-5xl font-bold tracking-tight text-slate-900 lg:text-6xl">
            Crafted for every pet.
          </h2>

          <p className="mt-8 text-xl leading-9 text-slate-600">
            Premium anodized aluminum with beautiful colors,
            built to survive everyday adventures.
          </p>

        </div>

        <TagPreview variant={selectedVariant} />

        <ColorPicker
          value={selectedColor}
          onChange={setSelectedColor}
        />

        <FeatureBadges />

      </div>
    </section>
  );
}