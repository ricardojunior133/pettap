"use client";

import { StudioProvider } from "./StudioContext";

import StudioShell from "./StudioShell";

export default function Studio({ initialConfiguration }: { initialConfiguration?: { collection?: string; design?: string; colour?: string; lineColour?: string; season?: "christmas" | "halloween" | "easter" } }) {
  return (
    <StudioProvider initialConfiguration={initialConfiguration}>
      <StudioShell />
    </StudioProvider>
  );
}
