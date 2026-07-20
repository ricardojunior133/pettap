"use client";

import Container from "@/components/layout/Container";

import CTAButtons from "./CTAButtons";
import DesktopNav from "./DesktopNav";
import Logo from "./Logo";
import MobileNav from "./MobileNav";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <Container>
        <div className="flex h-20 items-center justify-between">
          <Logo />

          <DesktopNav />

          <div className="hidden lg:block">
            <CTAButtons />
          </div>

          <MobileNav />
        </div>
      </Container>
    </header>
  );
}