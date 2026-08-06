import type { Metadata } from "next";
import { headers } from "next/headers";

import { PublicTagPage } from "@/components/rescue/PublicTagPage";
import { allowPublicTagRequest } from "@/features/public-tags/services/public-tag-rate-limit";
import { PublicTagService } from "@/features/public-tags/services/public-tag-service";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "PetTap Rescue", robots: { index: false, follow: false } };

export default async function RescuePage({ params }: { params: Promise<{ tagId: string }> }) {
  const { tagId } = await params; const requestHeaders = await headers(); const forwarded = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!allowPublicTagRequest(forwarded)) return <PublicTagPage resolution={{ kind: "rate_limited" }} />;
  const resolution = await new PublicTagService().resolve(tagId, { country: requestHeaders.get("x-vercel-ip-country"), userAgent: requestHeaders.get("user-agent") });
  return <PublicTagPage resolution={resolution} />;
}
