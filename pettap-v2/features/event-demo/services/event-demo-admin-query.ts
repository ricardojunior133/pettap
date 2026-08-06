const allowed = ["section", "tagsPage", "tagStatus", "tagEnabled", "attentionOnly", "sessionsPage", "sessionStatus", "sessionTag", "sessionPeriod", "leadsPage", "leadSource", "leadPeriod"] as const;
type Key = (typeof allowed)[number];
export type EventDemoAdminQuery = Partial<Record<Key, string>>;

export function eventDemoAdminQuery(source: Record<string, string | string[] | undefined>): EventDemoAdminQuery {
  const result: EventDemoAdminQuery = {};
  for (const key of allowed) { const value = source[key]; const first = Array.isArray(value) ? value[0] : value; if (typeof first === "string" && first) result[key] = first; }
  return result;
}
export function eventDemoAdminUrl(query: EventDemoAdminQuery, changes: Partial<Record<Key, string | null>> = {}) {
  const params = new URLSearchParams(query);
  for (const [key, value] of Object.entries(changes) as Array<[Key, string | null]>) { if (value) params.set(key, value); else params.delete(key); }
  const value = params.toString(); return value ? `/admin/event-demo?${value}` : "/admin/event-demo";
}
export function eventDemoAdminSectionUrl(query: EventDemoAdminQuery, section: "tags" | "sessions" | "leads", filters: Partial<Record<Key, string | null>>) {
  const pageKey = section === "tags" ? "tagsPage" : section === "sessions" ? "sessionsPage" : "leadsPage";
  return eventDemoAdminUrl(query, { ...filters, [pageKey]: "1", section });
}
