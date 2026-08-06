import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { EventDemoExperience } from "@/components/event-demo/EventDemoExperience";
import { EventDemoTagRepository } from "@/features/event-demo/repositories/event-demo-tag-repository";
import { EventDemoSessionRepository } from "@/features/event-demo/repositories/event-demo-session-repository";
import { eventDemoPublicCodeSchema } from "@/features/event-demo/schemas/event-demo";
import { readEventDemoCookie } from "@/features/event-demo/server/event-demo-cookie";
import { EventDemoSessionService } from "@/features/event-demo/services/event-demo-session-service";
import { SupabaseEventDemoPhotoStorage } from "@/features/event-demo/services/event-demo-photo-storage";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "PetTap Event Demo", robots: { index: false, follow: false } };

export default async function EventActivatePage({ params }: { params: Promise<{ publicCode: string }> }) {
  const { publicCode } = await params;
  if (!eventDemoPublicCodeSchema.safeParse(publicCode).success) notFound();
  const tag = await new EventDemoTagRepository().findByPublicCode(publicCode);
  if (!tag) notFound();
  const latestRepository = new EventDemoSessionRepository();
  const latest = await latestRepository.findLatestByTagId(tag.id);
  if (latest && latest.status !== "deleted" && latest.expiresAt <= new Date()) {
    try {
      const lifecycle = new EventDemoSessionService(undefined, new SupabaseEventDemoPhotoStorage());
      await lifecycle.expireSessionIfNeeded(latest.id);
      await lifecycle.cleanupExpiredSession(latest.id);
    } catch {
      return <main className="mx-auto max-w-xl px-4 py-16"><h1 className="text-3xl font-semibold">This PetTap tag is temporarily unavailable.</h1><p className="mt-3 text-neutral-600">Please speak to a PetTap team member for help.</p></main>;
    }
  }
  const currentLatest = await latestRepository.findLatestByTagId(tag.id);
  if (currentLatest?.status === "completed" && currentLatest.expiresAt > new Date()) redirect(`/event/profile/${currentLatest.publicId}`);
  let restoredSession = null;
  const cookie = await readEventDemoCookie(publicCode);
  if (cookie) {
    try { restoredSession = await new EventDemoSessionService().verifySessionAccess(cookie.publicId, cookie.token); } catch { restoredSession = null; }
  }
  if (tag.status === "disabled") return <main className="mx-auto max-w-xl px-4 py-16"><h1 className="text-3xl font-semibold">This PetTap tag is unavailable.</h1><p className="mt-3 text-neutral-600">Please speak to a PetTap team member for help.</p></main>;
  if (currentLatest && currentLatest.status !== "deleted" && currentLatest.status !== "expired" && !restoredSession) return <main className="mx-auto max-w-xl px-4 py-16"><h1 className="text-3xl font-semibold">This demo tag is currently being used.</h1><p className="mt-3 text-neutral-600">Please try again shortly or speak to a PetTap team member.</p></main>;
  return <EventDemoExperience publicCode={publicCode} restoredSession={restoredSession} />;
}
