export type TagSize = "petite" | "classic" | "explorer";
export type TagDesign =
  | "classic-round"
  | "dog-bone"
  | "cat-paw"
  | "heart"
  | "shield"
  | "hexagon"
  | "military"
  | "premium"
  | "luxury";
export type EngravingFont = "classic" | "rounded" | "modern" | "editorial" | "monogram";
export type EngravingIcon = "none" | "paw" | "heart" | "star" | "bone" | "fish" | "leaf" | "moon" | "crown" | "diamond" | "cat" | "flower";
export type TagMaterial = "PETG";
export type TagFinish = "matte" | "gloss";
export type TagLifecycleStatus = "unactivated" | "active" | "inactive" | "suspended" | "replacement" | "lost";

export interface PetTagConfiguration {
  petName: string;
  design: TagDesign;
  size: TagSize;
  colour: string;
  collection: string | null;
  material: TagMaterial;
  finish: TagFinish;
  engravingFont: EngravingFont;
  engravingIcon: EngravingIcon;
}

export interface Tag {
  id: string;
  petId?: string;
  uid?: string;
  activationCode?: string;
  status: TagLifecycleStatus;
  activatedAt?: string;
}
