import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function CTAButtons() {
  return (
    <div className="flex items-center gap-3">
      <Link href="/login">
        <Button variant="ghost">
          Sign In
        </Button>
      </Link>

      <Link href="/shop">
        <Button
          size="lg"
          className="rounded-xl px-6"
        >
          Design Your Tag
        </Button>
      </Link>
    </div>
  );
}