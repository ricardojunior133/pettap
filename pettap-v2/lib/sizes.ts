export interface TagSizeOption {
  id: "petite" | "classic" | "explorer";
  title: string;
  description: string;
  recommendedFor?: string[];
}

export const TAG_SIZES: TagSizeOption[] = [
  {
    id: "petite",
    title: "Petite",
    description: "Perfect for cats and toy breeds.",
    recommendedFor: ["Cats", "Chihuahua", "Yorkshire Terrier"],
  },
  {
    id: "classic",
    title: "Classic",
    description: "Our most popular size.",
  },
  {
    id: "explorer",
    title: "Explorer",
    description: "Designed for larger breeds.",
    recommendedFor: ["Labrador", "Golden Retriever", "German Shepherd"],
  },
];
