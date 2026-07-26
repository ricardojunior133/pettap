import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EventDemoAdminConsole } from "@/features/event-demo/components/event-demo-admin-console";
import { EventDemoAdminService } from "@/features/event-demo/services/event-demo-admin-service";
import { AdminPermissionDeniedError } from "@/features/admin/services/admin-authorization-service";
import { eventDemoAdminQuery } from "@/features/event-demo/services/event-demo-admin-query";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Event Demo Operations", robots: { index: false, follow: false } };

async function loadEventDemoOverview(searchParams: Promise<Record<string, string | string[] | undefined>>) {
  try {
    const search = await searchParams; const query = eventDemoAdminQuery(search);
    const page = (value: string | string[] | undefined) => Math.max(1, Number(Array.isArray(value) ? value[0] : value) || 1);
    const value = (key: string) => { const raw = search[key]; return Array.isArray(raw) ? raw[0] : raw; };
    const status = value("tagStatus");
    const allowedStatuses = ["available", "in_progress", "completed", "expired", "disabled"] as const;
    const enabled = value("tagEnabled"); const sessionStatus = value("sessionStatus"); const sessionPeriod = value("sessionPeriod"); const leadSource = value("leadSource"); const leadPeriod = value("leadPeriod");
    const overview = await new EventDemoAdminService().overview({ tagPage: page(search.tagsPage), sessionPage: page(search.sessionsPage), leadPage: page(search.leadsPage), tagStatus: allowedStatuses.includes(status as typeof allowedStatuses[number]) ? status as typeof allowedStatuses[number] : undefined, tagEnabled: enabled === "true" ? true : enabled === "false" ? false : undefined, attentionOnly: value("attentionOnly") === "true", sessionStatus: ["started", "profile_created", "completed", "expired", "deleted"].includes(sessionStatus ?? "") ? sessionStatus as "started" | "profile_created" | "completed" | "expired" | "deleted" : undefined, sessionTag: value("sessionTag"), sessionPeriod: ["today", "24h", "7d"].includes(sessionPeriod ?? "") ? sessionPeriod as "today" | "24h" | "7d" : undefined, leadSource: ["event_demo", "fair"].includes(leadSource ?? "") ? leadSource as "event_demo" | "fair" : undefined, leadPeriod: ["today", "7d", "30d"].includes(leadPeriod ?? "") ? leadPeriod as "today" | "7d" | "30d" : undefined });
    return { ...overview, query };
  } catch (error) { if (error instanceof AdminPermissionDeniedError) notFound(); throw error; }
}

export default async function EventDemoAdminPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const overview = await loadEventDemoOverview(searchParams);
  return <><header className="mb-8"><p className="text-xs font-semibold uppercase tracking-[.18em] text-neutral-500">Private fair operations</p><h1 className="mt-3 text-3xl font-semibold tracking-[-.05em] sm:text-5xl">Event Demo Mode</h1><p className="mt-3 max-w-2xl text-neutral-600">Create, operate and safely reset temporary PetTap demonstrations. All visitor data remains short-lived.</p></header><EventDemoAdminConsole {...overview} /></>;
}
