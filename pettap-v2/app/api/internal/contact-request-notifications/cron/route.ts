import { verifyBearerSecret } from "@/features/contact-request-notifications/internal-worker-auth";
import { processPendingNotifications, type ProcessPendingNotificationsResult } from "@/features/contact-request-notifications/process-pending-notifications";
import { runContactNotificationWorker, workerJson, workerMethodNotAllowed } from "@/features/contact-request-notifications/worker-route-response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

type CronRouteDependencies = {
  cronSecret: string | undefined;
  processPending: () => Promise<ProcessPendingNotificationsResult>;
};

/**
 * Vercel Cron invokes production paths using GET and CRON_SECRET. This adapter
 * intentionally cannot authenticate with the manual worker secret.
 */
export function createContactNotificationCronHandler(dependencies: CronRouteDependencies) {
  return async function GET(request: Request) {
    const authorization = verifyBearerSecret(request.headers.get("authorization"), dependencies.cronSecret);
    if (authorization === "missing_secret") return workerJson({ ok: false }, 503);
    if (authorization !== "authorized") return workerJson({ ok: false }, 401);
    return runContactNotificationWorker(dependencies.processPending);
  };
}

export const GET = createContactNotificationCronHandler({
  cronSecret: process.env.CRON_SECRET,
  processPending: processPendingNotifications,
});

export async function POST() { return workerMethodNotAllowed(); }
export async function PUT() { return workerMethodNotAllowed(); }
