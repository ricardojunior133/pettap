"use client";

import StudioSection from "@/components/pettap/StudioSection";
import Card from "@/components/ui/Card";

import CollectionSelector from "./controls/CollectionSelector";
import ColourSelector from "./controls/ColourSelector";
import DesignSelector from "./controls/DesignSelector";
import EngravingSelector from "./controls/EngravingSelector";
import FinishSelector from "./controls/FinishSelector";
import MaterialSelector from "./controls/MaterialSelector";
import NameInput from "./controls/NameInput";
import SizeSelector from "./controls/SizeSelector";

interface StudioWorkspaceProps {
  className?: string;
}

export default function StudioWorkspace({ className = "" }: StudioWorkspaceProps) {
  return (
    <div className={`space-y-5 pb-20 sm:space-y-6 lg:pb-0 ${className}`}>
      <Card className="border-black/[0.06] bg-white p-6 shadow-[0_12px_40px_rgba(17,17,17,0.035)] sm:p-8">
        <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-neutral-500">
          Make it yours
        </span>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.045em] text-neutral-950 sm:text-4xl">
          Personalise your PetTag
        </h1>
        <p className="mt-3 max-w-lg text-sm leading-6 text-neutral-500 sm:text-base">
          Design a tag that&apos;s as unique as your best friend.
        </p>
      </Card>

      <StudioSection title="01 — Pick a shape" description="Start with a silhouette that feels right.">
        <DesignSelector />
      </StudioSection>
      <StudioSection title="02 — Choose a colour" description="Choose the colour that matches their character.">
        <ColourSelector />
      </StudioSection>
      <StudioSection title="03 — Choose a size" description="Find a comfortable fit for every adventure.">
        <SizeSelector />
      </StudioSection>
      <StudioSection title="04 — What&apos;s your pet&apos;s name?" description="Watch the engraving come to life as you type.">
        <NameInput />
      </StudioSection>
      <StudioSection title="05 — Choose a font" description="Select a lettering style that feels like them.">
        <EngravingSelector mode="font" />
      </StudioSection>
      <StudioSection title="06 — Choose an icon" description="A subtle signature, if it feels right.">
        <EngravingSelector mode="icon" />
      </StudioSection>
      <StudioSection title="07 — Material" description="Thoughtfully selected for a premium everyday tag.">
        <MaterialSelector />
      </StudioSection>
      <StudioSection title="08 — Surface finish" description="Choose the final character of the material.">
        <FinishSelector />
      </StudioSection>
      <StudioSection title="09 — Start with a collection" description="Choose a story for your PetTag.">
        <CollectionSelector />
      </StudioSection>
    </div>
  );
}
