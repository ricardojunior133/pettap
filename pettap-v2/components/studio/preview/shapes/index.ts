import RoundTag from "./RoundTag";
import { createElement } from "react";
import type { TagDesign } from "@/types/tag";
import SignatureTag, { type SignatureTagProps } from "./SignatureTag";

function signature(variant: TagDesign) {
  return function SignatureShape(props: Omit<SignatureTagProps, "variant">) {
    return createElement(SignatureTag, { ...props, variant });
  };
}

export const SHAPES = {
  "classic-round": RoundTag,
  "dog-bone": signature("dog-bone"),
  "cat-paw": signature("cat-paw"),
  heart: signature("heart"),
  shield: signature("shield"),
  hexagon: signature("hexagon"),
  military: signature("military"),
  premium: signature("premium"),
  luxury: signature("luxury"),
};
