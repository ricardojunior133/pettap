export interface Shape {
  id: string;
  name: string;
  tagline: string;
  description: string;
  image: string;

  availableSizes: string[];

  active: boolean;
}

export interface Collection {
  id: string;
  name: string;
  description: string;

  featured: boolean;
  active: boolean;

  shapes: Shape[];
}
export interface Color {
  id: string;
  name: string;
  hex: string;
}
export interface Size {
  id: string;
  name: string;
  description: string;

  width: number;
  height: number;
}