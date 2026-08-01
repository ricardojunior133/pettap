import { isContactNotificationWorkerAuthorized } from "@/features/contact-request-notifications/internal-worker-auth";
import { processPendingNotifications, type ProcessPendingNotificationsResult } from "@/features/contact-request-notifications/process-pending-notifications";
import { runContactNotificationWorker, workerJson, workerMethodNotAllowed } from "@/features/contact-request-notifications/worker-route-response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type WorkerRouteDependencies = {
  workerSecret: string | undefined;
  processPending: () => Promise<ProcessPendingNotificationsResult>;
};

/** Exported for local contract tests; production uses only the environment-backed POST handler. */
export function createContactNotificationWorkerHandler(dependencies: WorkerRouteDependencies) {
  return async function POST(request: Request) {
    if (!isContactNotificationWorkerAuthorized(request.headers.get("authorization"), dependencies.workerSecret)) {
      return workerJson({ ok: false }, 401);
    }
    return runContactNotificationWorker(dependencies.processPending);
  };
}

export const POST = createContactNotificationWorkerHandler({
  workerSecret: process.env.CONTACT_NOTIFICATION_WORKER_SECRET,
  processPending: processPendingNotifications,
});

/** Unsupported methods are explicitly rejected without revealing worker state. */
export async function GET() {
  return workerMethodNotAllowed();
}
