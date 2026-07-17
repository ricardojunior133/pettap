import { Collection } from "../types/product";

export const collections: Collection[] = [
  {
    id: "essential",
    name: "Essential Collection",
    description: "Timeless designs for everyday adventures.",
    featured: true,
    active: true,
    shapes: [
      {
        id: "bone",
        name: "Bone",
        tagline: "Classic and playful.",
        description: "Perfect for adventurous dogs.",
        image: "/images/shapes/bone.png",
        availableSizes: ["petite", "classic", "explorer"],
        active: true,
      },
      {
        id: "heart",
        name: "Heart",
        tagline: "Made with love.",
        description: "A timeless symbol for your best friend.",
        image: "/images/shapes/heart.png",
        availableSizes: ["petite", "classic"],
        active: true,
      },
      {
        id: "paw",
        name: "Paw",
        tagline: "Every step together.",
        description: "Inspired by the footprints they leave on our hearts.",
        image: "/images/shapes/paw.png",
        availableSizes: ["petite", "classic", "explorer"],
        active: true,
      },
    ],
  },
];