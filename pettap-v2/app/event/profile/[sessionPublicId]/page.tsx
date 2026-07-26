import type { Metadata } from "next";
import { headers } from "next/headers";

import { EventDemoExpiredState, EventDemoPublicProfile } from "@/components/event-demo/EventDemoPublicProfile";
import { EventDemoPublicProfileService } from "@/features/event-demo/services/event-demo-public-profile-service";
import { clientRequestKey, checkRateLimit } from "@/lib/security/rate-limit";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "PetTap Live Event Demo", robots: { index: false, follow: false } };

export default async function EventDemoPublicProfilePage({ params }: { params: Promise<{ sessionPublicId: string }> }) {
  const { sessionPublicId } = await params;
  const requestHeaders = await headers();
  if (!checkRateLimit(clientRequestKey(requestHeaders, "event-demo:profile"), { limit: 90, windowMs: 60_000 }).allowed) return <EventDemoExpiredState />;
  const result = await new EventDemoPublicProfileService().resolve(sessionPublicId);
  return result.kind === "profile" ? <EventDemoPublicProfile profile={result.profile} /> : <EventDemoExpiredState />;
}
