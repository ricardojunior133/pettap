"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import type { ProductAccentColour, ProductName, ProductPrimaryColour, ProductShape, ProductSide, ProductSize } from "./productShowcaseOptions";
import { productAccentColours, productNames, productPrimaryColours, productShapes, productSizes } from "./productShowcaseOptions";

interface PersonalisationControlsProps {
  name: ProductName;
  shape: ProductShape;
  primaryColour: ProductPrimaryColour;
  accentColour: ProductAccentColour;
  size: ProductSize;
  side: ProductSide;
  onNameChange: (value: ProductName) => void;
  onShapeChange: (value: ProductShape) => void;
  onPrimaryColourChange: (value: ProductPrimaryColour) => void;
  onAccentColourChange: (value: ProductAccentColour) => void;
  onSizeChange: (value: ProductSize) => void;
  onSideChange: (value: ProductSide) => void;
}

const sizeDescriptions: Record<ProductSize, string> = {
  Petite: "For cats and toy breeds.",
  Classic: "For most dogs.",
  Explorer: "For larger dogs and outdoor adventures.",
};

export default function PersonalisationControls({ name, shape, primaryColour, accentColour, size, side, onNameChange, onShapeChange, onPrimaryColourChange, onAccentColourChange, onSizeChange, onSideChange }: PersonalisationControlsProps) {
  return <div className="rounded-[2rem] border border-black/[0.07] bg-white/80 p-6 shadow-[0_14px_38px_rgba(17,17,17,0.04)] sm:p-7">
    <ControlGroup label="View">
      <div className="grid grid-cols-2 gap-2">{(["front", "back"] as const).map((option) => <ChoiceButton key={option} active={side === option} onClick={() => onSideChange(option)}>{option === "front" ? "Front" : "Back"}</ChoiceButton>)}</div>
    </ControlGroup>
    <ControlGroup label="Pet name">
      <div className="grid grid-cols-3 gap-2">{productNames.map((option) => <ChoiceButton key={option} active={name === option} onClick={() => onNameChange(option)}>{option}</ChoiceButton>)}</div>
    </ControlGroup>
    <ControlGroup label="Shape">
      <div className="grid grid-cols-2 gap-2">{productShapes.map((option) => <ChoiceButton key={option} active={shape === option} onClick={() => onShapeChange(option)}>{option}</ChoiceButton>)}</div>
      <Link href="/studio?collection=essential" className="mt-3 inline-flex min-h-10 items-center text-sm font-semibold text-neutral-800 underline decoration-neutral-300 underline-offset-4 transition hover:decoration-neutral-950 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-neutral-950/15">View all Essential shapes</Link>
    </ControlGroup>
    <ControlGroup label="Primary colour">
      <ColourSelector label="Choose a primary colour" selected={primaryColour} options={productPrimaryColours} onChange={onPrimaryColourChange} />
    </ControlGroup>
    <ControlGroup label="Accent colour">
      <ColourSelector label="Choose an accent colour" selected={accentColour} options={productAccentColours} onChange={onAccentColourChange} />
    </ControlGroup>
    <ControlGroup label="Size">
      <div className="grid gap-2">{productSizes.map((option) => <button key={option} type="button" aria-pressed={size === option} onClick={() => onSizeChange(option)} className={`rounded-xl border px-3.5 py-3 text-left transition duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-neutral-950/15 motion-reduce:transition-none ${size === option ? "border-neutral-950 bg-neutral-950 text-white" : "border-black/[0.08] bg-white text-neutral-800 hover:border-black/20"}`}><span className="block text-sm font-semibold">{option}</span><span className={`mt-1 block text-xs leading-5 ${size === option ? "text-white/70" : "text-neutral-500"}`}>{sizeDescriptions[option]}</span></button>)}</div>
    </ControlGroup>
  </div>;
}

function ColourSelector<T extends string>({ label, selected, options, onChange }: { label: string; selected: T; options: readonly { id: T; label: string; value: string }[]; onChange: (value: T) => void }) {
  return <div role="group" aria-label={label} className="flex flex-wrap gap-3">{options.map((option) => <button key={option.id} type="button" aria-pressed={selected === option.id} aria-label={`${option.label}${selected === option.id ? ", selected" : ""}`} onClick={() => onChange(option.id)} className={`flex size-10 items-center justify-center rounded-full transition duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-neutral-950/15 motion-reduce:transition-none ${selected === option.id ? "ring-1 ring-neutral-950 ring-offset-4" : "ring-1 ring-black/[0.10] ring-offset-2"}`}><span aria-hidden="true" className="size-7 rounded-full border border-black/[0.12] shadow-inner" style={{ backgroundColor: option.value }} /></button>)}</div>;
}

function ControlGroup({ label, children }: { label: string; children: ReactNode }) {
  return <fieldset className="mt-6 first:mt-0"><legend className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500">{label}</legend>{children}</fieldset>;
}

function ChoiceButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return <button type="button" aria-pressed={active} onClick={onClick} className={`min-h-10 rounded-xl border px-3 text-sm font-semibold transition duration-200 hover:border-black/20 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-neutral-950/15 motion-reduce:transition-none ${active ? "border-neutral-950 bg-neutral-950 text-white" : "border-black/[0.08] bg-white text-neutral-700"}`}>{children}</button>;
}
