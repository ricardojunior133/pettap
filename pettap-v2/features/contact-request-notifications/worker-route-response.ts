import "server-only";

import { NextResponse } from "next/server";

import type { ProcessPendingNotificationsResult } from "./process-pending-notifications";

export const privateWorkerHeaders = {
  "Cache-Control": "no-store",
  "X-Robots-Tag": "noindex, nofollow",
  "Content-Type": "application/json; charset=utf-8",
};

export function workerJson(body: object, status = 200) {
  return NextResponse.json(body, { status, headers: privateWorkerHeaders });
}

/** Shared response boundary for all private triggers. It never returns delivery data. */
export async function runContactNotificationWorker(processPending: () => Promise<ProcessPendingNotificationsResult>) {
  try {
    const result = await processPending();
    return workerJson({ ok: true, processed: result.claimed, sent: result.sent, retried: result.retryScheduled, failed: result.failed, cancelled: result.cancelled });
  } catch {
    return workerJson({ ok: false }, 500);
  }
}

export function workerMethodNotAllowed() {
  return workerJson({ ok: false }, 405);
}
