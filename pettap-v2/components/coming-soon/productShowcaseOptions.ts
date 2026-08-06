export const productNames = ["Charlie", "Luna", "Milo"] as const;
export const productShapes = ["Round", "Bone", "Heart", "Paw", "Shield", "Star"] as const;
export const productSizes = ["Petite", "Classic", "Explorer"] as const;

export const productPrimaryColours = [
  { id: "black", label: "Black", value: "#202020" },
  { id: "blue", label: "Blue", value: "#3f75d4" },
  { id: "pink", label: "Pink", value: "#d888a4" },
  { id: "purple", label: "Purple", value: "#8d72c8" },
  { id: "green", label: "Green", value: "#4d8b6a" },
  { id: "orange", label: "Orange", value: "#cf7d43" },
] as const;

export const productAccentColours = [
  { id: "white", label: "White", value: "#F5F5F5" },
  { id: "silver", label: "Silver", value: "#C7C7CC" },
  { id: "gold", label: "Gold", value: "#C99B45" },
  { id: "black", label: "Black", value: "#111111" },
] as const;

export type ProductName = (typeof productNames)[number];
export type ProductShape = (typeof productShapes)[number];
export type ProductSize = (typeof productSizes)[number];
export type ProductPrimaryColour = (typeof productPrimaryColours)[number]["id"];
export type ProductAccentColour = (typeof productAccentColours)[number]["id"];
export type ProductSide = "front" | "back";
