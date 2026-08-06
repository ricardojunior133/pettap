import "server-only";

import { cookies } from "next/headers";

import { eventDemoPublicCodeSchema, eventDemoPublicIdSchema } from "../schemas/event-demo";

type EventDemoCookieValue = { publicId: string; token: string };

function cookieName(publicCode: string) {
  return `pettap_event_${publicCode}`;
}

export async function setEventDemoCookie(publicCode: string, value: EventDemoCookieValue, expiresAt: Date) {
  eventDemoPublicCodeSchema.parse(publicCode);
  eventDemoPublicIdSchema.parse(value.publicId);
  const store = await cookies();
  store.set(cookieName(publicCode), `${value.publicId}.${value.token}`, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/event", expires: expiresAt, priority: "high" });
}

export async function readEventDemoCookie(publicCode: string): Promise<EventDemoCookieValue | null> {
  if (!eventDemoPublicCodeSchema.safeParse(publicCode).success) return null;
  const value = (await cookies()).get(cookieName(publicCode))?.value;
  if (!value) return null;
  const [publicId, token, extra] = value.split(".");
  if (extra || !eventDemoPublicIdSchema.safeParse(publicId).success || !token || !/^[A-Za-z0-9_-]{43}$/.test(token)) return null;
  return { publicId, token };
}

export async function clearEventDemoCookie(publicCode: string) {
  if (!eventDemoPublicCodeSchema.safeParse(publicCode).success) return;
  (await cookies()).delete(cookieName(publicCode));
}
