"use client";

import { StudioProvider } from "./StudioContext";

import Container from "@/components/ui/Container";

import StudioHeader from "./StudioHeader";
import StudioPreview from "./StudioPreview";
import StudioWorkspace from "./StudioWorkspace";
import MobileStudioCTA from "./MobileStudioCTA";
import SummaryCard from "@/components/pettap/SummaryCard";

export default function Studio() {
  return (
    <StudioProvider>
      <main className="min-h-screen bg-[#fbfbfa]">
        <StudioHeader />

        <Container className="py-8 sm:py-12 lg:py-16">
          <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,0.94fr)_minmax(0,1.06fr)] xl:gap-16">
            <StudioWorkspace className="order-2 xl:order-1" />
            <div className="order-1 space-y-5 xl:sticky xl:top-28 xl:order-2">
              <StudioPreview />
              <div className="hidden xl:block"><SummaryCard /></div>
            </div>
          </div>
          <div id="studio-summary" className="mt-6 scroll-mt-24 xl:hidden"><SummaryCard /></div>
        </Container>
        <MobileStudioCTA />
      </main>
    </StudioProvider>
  );
}
