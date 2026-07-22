import { ReactNode } from "react";
import Card from "@/components/ui/Card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { COLLECTIONS } from "@/lib/collections";

interface StudioCardProps {
  children: ReactNode;
  size: string;
  colour: string;
  collection?: string | null;
  petName: string;
}

export default function StudioCard({
  children,
  size,
  colour,
  collection,
  petName,
}: StudioCardProps) {
  const colourName =
    {
      "#111111": "Midnight",
      "#F5F5F5": "Snow",
      "#2563EB": "Ocean",
      "#166534": "Forest",
      "#B76E79": "Blossom",
      "#B42318": "Crimson",
    }[colour] ?? colour;
  const collectionName = COLLECTIONS.find((item) => item.id === collection)?.name ?? "Signature";

  return (
    <div className="rounded-[32px] transition-shadow duration-700" style={{ boxShadow: `0 26px 64px ${colour}12, 0 10px 26px rgba(17,17,17,0.08)` }}>
      <Card className="overflow-hidden rounded-[32px] border-black/[0.06] bg-white shadow-none">
        <div className="relative isolate overflow-hidden bg-[radial-gradient(circle_at_50%_38%,#ffffff_0%,#f5f5f4_48%,#ececea_100%)] px-6 py-12 sm:px-8 sm:py-16">
        <div className="pointer-events-none absolute left-1/2 top-[42%] h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl transition-colors duration-700" style={{ backgroundColor: `${colour}18` }} />
        <div className="pointer-events-none absolute left-1/2 top-[24%] h-24 w-40 -translate-x-1/2 -rotate-12 rounded-full bg-white/30 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-white/90" />
        <div className="pointer-events-none absolute bottom-10 left-1/2 h-5 w-48 -translate-x-1/2 rounded-full bg-black/10 blur-xl" />
        <div className="relative flex min-h-[280px] items-center justify-center transition-transform duration-500 ease-out hover:scale-[1.025] sm:min-h-[330px]">
          {children}
        </div>
        </div>

        <Separator />

      {/* Details */}
        <div className="space-y-5 p-6 sm:p-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-400">Your configuration</p>
        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-500">Collection</span>

          <Badge variant="outline">
            {collectionName}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-500">Size</span>

          <span className="text-sm font-medium capitalize text-neutral-900">
            {size}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-500">Finish</span>

          <div className="flex items-center gap-2">
            <div
              className="h-4 w-4 rounded-full border"
              style={{ background: colour }}
            />

            <span className="text-sm font-medium text-neutral-900">
              {colourName}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-500">Pet Name</span>

          <span className="text-sm font-semibold text-neutral-900">
            {petName || "Your Pet"}
          </span>
        </div>
        </div>
      </Card>
    </div>
  );
}
