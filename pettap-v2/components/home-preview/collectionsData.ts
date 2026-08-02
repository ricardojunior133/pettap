export interface HomeCollection {
  id: "essential" | "breed" | "cat" | "nature" | "luxury" | "kids" | "celebration" | "seasonal";
  title: string;
  description: string;
  image: string;
  href: string;
  badge?: "Personalise" | "Seasonal";
}

/**
 * Home deliberately groups the three time-limited Studio catalogues under
 * Seasonal, while their individual catalogues remain available in the Studio.
 */
export const homeCollections: readonly HomeCollection[] = [
  {
    id: "essential",
    title: "Essential Collection",
    description: "Personalised shapes featuring your pet's name.",
    image: "/images/collections/cards/essential.webp",
    href: "/studio?collection=essential",
    badge: "Personalise",
  },
  {
    id: "breed",
    title: "Breed Collection",
    description: "Distinctive designs inspired by popular dog breeds.",
    image: "/images/collections/cards/breed.webp",
    href: "/studio?collection=breed",
  },
  {
    id: "cat",
    title: "Cat Collection",
    description: "Created especially for cats and feline personalities.",
    image: "/images/collections/cards/cat.webp",
    href: "/studio?collection=cat",
  },
  {
    id: "nature",
    title: "Nature Collection",
    description: "Organic shapes inspired by forests, mountains and the natural world.",
    image: "/images/collections/cards/nature.webp",
    href: "/studio?collection=nature",
  },
  {
    id: "luxury",
    title: "Luxury Collection",
    description: "Refined details and elegant designs with a premium finish.",
    image: "/images/collections/cards/luxury.webp",
    href: "/studio?collection=luxury",
  },
  {
    id: "kids",
    title: "Kids Collection",
    description: "Playful, cheerful designs full of personality.",
    image: "/images/collections/cards/kids.webp",
    href: "/studio?collection=kids",
  },
  {
    id: "celebration",
    title: "Celebration Collection",
    description: "Special designs for birthdays, milestones and memorable moments.",
    image: "/images/collections/cards/celebration.webp",
    href: "/studio?collection=celebration",
  },
  {
    id: "seasonal",
    title: "Seasonal Collection",
    description: "Limited designs inspired by Christmas, Halloween, Easter and special moments throughout the year.",
    image: "/images/collections/cards/seasonal.webp",
    href: "/studio?collection=seasonal",
    badge: "Seasonal",
  },
];
