import RoundTag from "./RoundTag";
import { createElement, type ComponentProps, type ComponentType } from "react";
import type { TagDesign } from "@/types/tag";
import SignatureTag, { type SignatureTagProps } from "./SignatureTag";
import EssentialTag from "./EssentialTag";
import { ESSENTIAL_SHAPES } from "@/lib/studio/essential-shapes";

function signature(variant: TagDesign) {
  return function SignatureShape(props: Omit<SignatureTagProps, "variant">) {
    return createElement(SignatureTag, { ...props, variant });
  };
}

type StudioShapeComponent = ComponentType<Omit<SignatureTagProps, "variant">>;

export const SHAPES = {
  ...Object.fromEntries(ESSENTIAL_SHAPES.map((shape) => [shape.id, function EssentialShape(props: Omit<ComponentProps<typeof EssentialTag>, "design">) { return createElement(EssentialTag, { ...props, design: shape.id }); }])),
  "classic-round": RoundTag,
  "dog-bone": signature("dog-bone"),
  "cat-paw": signature("cat-paw"),
  heart: signature("heart"),
  shield: signature("shield"),
  hexagon: signature("hexagon"),
  military: signature("military"),
  premium: signature("premium"),
  luxury: signature("luxury"),
} as Record<TagDesign, StudioShapeComponent>;
