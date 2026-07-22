import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function HeroContent() {
  return (
    <div className="flex max-w-xl flex-col">
      <Badge
        variant="secondary"
        className="mb-6 w-fit rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em]"
      >
        <ShieldCheck className="mr-2 h-4 w-4" />
        Smart Pet Recovery
      </Badge>

      <h1 className="font-heading text-5xl font-bold leading-tight tracking-tight text-foreground lg:text-7xl">
        Because every pet
        <br />
        deserves a safe
        <br />
        way home.
      </h1>

      <p className="mt-8 max-w-lg text-lg leading-8 text-muted-foreground">
        A beautifully made NFC tag opens your pet&apos;s profile with a simple tap,
        helping the right person reach you when it matters most.
      </p>

      <div className="mt-10 flex flex-wrap gap-4">
        <Link href="/studio">
          <Button
            size="lg"
            className="rounded-xl px-8"
          >
            Personalise Your PetTap
          </Button>
        </Link>

        <Link href="#how-it-works">
          <Button
            variant="outline"
            size="lg"
            className="rounded-xl px-8"
          >
            Learn More
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>

      <div className="mt-12 grid grid-cols-2 gap-x-8 gap-y-4">
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-primary" />
          <span className="text-sm font-medium">NFC Enabled</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-primary" />
          <span className="text-sm font-medium">No app needed</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-primary" />
          <span className="text-sm font-medium">Made for everyday walks</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-primary" />
          <span className="text-sm font-medium">No Subscription</span>
        </div>
      </div>
    </div>
  );
}
