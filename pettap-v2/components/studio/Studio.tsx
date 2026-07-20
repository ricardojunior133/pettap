"use client";

import Container from "@/components/ui/Container";

import StudioHeader from "./StudioHeader";
import StudioPreview from "./StudioPreview";
import StudioWorkspace from "./StudioWorkspace";

export default function Studio() {
  return (
    <main className="min-h-screen bg-white">
      <StudioHeader />

      <Container className="py-12">
        <div className="grid gap-14 lg:grid-cols-[1.2fr_0.8fr] items-start">
          <StudioPreview />

          <StudioWorkspace />
        </div>
      </Container>
    </main>
  );
}