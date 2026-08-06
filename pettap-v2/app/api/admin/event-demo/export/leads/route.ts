import { NextResponse } from "next/server";

import { EventDemoAdminService } from "@/features/event-demo/services/event-demo-admin-service";

export const dynamic = "force-dynamic";
function cell(value: string | null) { const text = value ?? ""; return /^[=+\-@]/.test(text) ? `"'${text.replace(/"/g, '""')}"` : `"${text.replace(/"/g, '""')}"`; }
export async function GET() {
  const leads = await new EventDemoAdminService().exportLeads();
  const rows = ["first_name,email,source,consent_version,consented_at", ...leads.map((lead) => [lead.firstName, lead.email, lead.source, lead.consentVersion, lead.consentedAt?.toISOString() ?? null].map(cell).join(","))];
  return new NextResponse(`\uFEFF${rows.join("\r\n")}\r\n`, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename=\"pettap-fair-leads-${new Date().toISOString().slice(0, 10)}.csv\"`, "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" } });
}
