import { NextResponse } from "next/server";

import { getServerEnv } from "@/lib/backend/env";
import { createDatabaseClient } from "@/lib/backend/db";
import { logEvent } from "@/lib/observability/logger";
import { sql } from "drizzle-orm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function response(healthy: boolean) {
  return NextResponse.json(
    { status: healthy ? "ok" : "degraded" },
    { status: healthy ? 200 : 503, headers: { "Cache-Control": "no-store, max-age=0", "X-Robots-Tag": "noindex, nofollow" } },
  );
}

/** Intentionally exposes no environment values, database details, or credentials. */
export async function GET() {
  try {
    getServerEnv();
    await createDatabaseClient().execute(sql`select 1`);
    return response(true);
  } catch {
    logEvent("error", "health.configuration_invalid");
    return response(false);
  }
}

export async function HEAD() {
  const result = await GET();
  return new NextResponse(null, { status: result.status, headers: result.headers });
}
