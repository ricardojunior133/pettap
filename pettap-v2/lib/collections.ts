export interface Collection {
  id: string;
  name: string;
  description: string;
  icon: string;
  accent: string;
}

export const COLLECTIONS: Collection[] = [
  {
    id: "classic",
    name: "Signature",
    description: "Timeless everyday elegance.",
    accent: "#e7e5e4",
    icon: "⭕",
  },
  {
    id: "dogs",
    name: "Adventure",
    description: "Designed for outdoor explorers.",
    accent: "#d9eadb",
    icon: "🦴",
  },
  {
    id: "cats",
    name: "Woodland",
    description: "Inspired by nature.",
    accent: "#dbe8d4",
    icon: "🐾",
  },
  {
    id: "coastal",
    name: "Coastal",
    description: "Fresh and playful.",
    icon: "Co",
    accent: "#d9edf3",
  },
];
