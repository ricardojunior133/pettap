"use client";

import Link from "next/link";
import { Menu } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { Button } from "@/components/ui/button";

const navigation = [
  { label: "Home", href: "/" },
  { label: "How it Works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "FAQ", href: "#faq" },
];

export default function MobileNav() {
  return (
    <div className="lg:hidden">
      <Sheet>
        <SheetTrigger
          render={
            <Button
              size="icon"
              variant="ghost"
            >
              <Menu className="h-6 w-6" />
            </Button>
          }
        />

        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>PetTap</SheetTitle>
          </SheetHeader>

          <nav className="mt-10 flex flex-col gap-6">
            {navigation.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-lg font-medium transition-colors hover:text-primary"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-10 flex flex-col gap-3">
            <Button variant="outline">
              Sign In
            </Button>

            <Button>
              Design Your Tag
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}