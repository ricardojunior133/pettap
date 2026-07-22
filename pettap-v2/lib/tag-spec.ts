export type TagSize = "petite" | "classic" | "explorer";

export interface TagSpecification {
  label: string;
  diameter: number;
  holeDiameter: number;
  holeOffset: number;
  engravingArea: {
    width: number;
    height: number;
  };
}

export const TAG_SPEC: Record<TagSize, TagSpecification> = {
  petite: {
    label: "Petite",
    diameter: 22,
    holeDiameter: 3,
    holeOffset: 4,
    engravingArea: {
      width: 14,
      height: 8,
    },
  },

  classic: {
    label: "Classic",
    diameter: 28,
    holeDiameter: 4,
    holeOffset: 5,
    engravingArea: {
      width: 18,
      height: 10,
    },
  },

  explorer: {
    label: "Explorer",
    diameter: 34,
    holeDiameter: 5,
    holeOffset: 6,
    engravingArea: {
      width: 22,
      height: 12,
    },
  },
};