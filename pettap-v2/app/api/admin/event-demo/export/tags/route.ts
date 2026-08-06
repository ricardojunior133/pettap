import { NextResponse } from "next/server";

import { EventDemoAdminService } from "@/features/event-demo/services/event-demo-admin-service";

export const dynamic = "force-dynamic";

function cell(value: string | number) { const text = String(value); return /^[=+\-@]/.test(text) ? `"'${text.replace(/"/g, '""')}"` : `"${text.replace(/"/g, '""')}"`; }
export async function GET() {
  const tags = await new EventDemoAdminService().exportTags();
  const origin = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  const rows = ["internal_name,public_code,activation_url,status,session_duration_minutes", ...tags.map((tag) => [tag.internalName, tag.publicCode, origin ? `${origin}/event/activate/${tag.publicCode}` : `/event/activate/${tag.publicCode}`, tag.status, tag.sessionDurationMinutes].map(cell).join(","))];
  return new NextResponse(`\uFEFF${rows.join("\r\n")}\r\n`, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename=\"pettap-event-demo-tags-${new Date().toISOString().slice(0, 10)}.csv\"`, "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" } });
}
