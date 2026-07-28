import Link from "next/link";

import Card from "@/components/ui/Card";
import {
  CustomerNotificationService,
  type CustomerNotificationStatus,
  type CustomerNotificationsPageViewModel,
} from "@/features/account/services/customer-notification-service";

type NotificationsPageProps = { searchParams: Promise<{ page?: string | string[] }> };

const statusClasses: Record<CustomerNotificationStatus, string> = {
  Sent: "bg-emerald-50 text-emerald-800",
  Processing: "bg-amber-50 text-amber-800",
  Failed: "bg-rose-50 text-rose-800",
  "Not sent": "bg-neutral-100 text-neutral-700",
};

function getPage(value: string | string[] | undefined) {
  const candidate = Array.isArray(value) ? value[0] : value;
  const page = Number(candidate);
  return Number.isInteger(page) && page > 0 ? page : 1;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}

async function loadNotifications(page: number): Promise<CustomerNotificationsPageViewModel | null> {
  try {
    return await new CustomerNotificationService().listNotifications({ page });
  } catch {
    return null;
  }
}

export default async function AccountNotificationsPage({ searchParams }: NotificationsPageProps) {
  const { page: pageParam } = await searchParams;
  const notificationPage = await loadNotifications(getPage(pageParam));

  if (!notificationPage) {
    return <section role="alert"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">Notifications</p><h1 className="mt-3 text-4xl font-semibold tracking-[-0.06em]">Order updates</h1><Card variant="outlined" className="mt-8 p-7"><h2 className="text-xl font-semibold">We couldn&apos;t load your order updates.</h2><p className="mt-3 text-sm leading-6 text-neutral-600">Please refresh the page or try again shortly.</p></Card></section>;
  }

  return (
    <section aria-labelledby="notifications-heading">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">Notifications</p>
      <h1 id="notifications-heading" className="mt-3 text-4xl font-semibold tracking-[-0.06em]">Order updates</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600">A private record of important updates for your orders.</p>

      <Card variant="outlined" className="mt-8 p-6 sm:p-8">
        <h2 className="text-xl font-semibold tracking-[-0.04em]">Essential order updates</h2>
        <p className="mt-2 text-sm leading-6 text-neutral-600">Payment, production, delivery, and cancellation updates are always enabled so we can keep you informed about your order.</p>
        <p className="mt-4 inline-flex rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-700">Always on</p>
      </Card>

      <Card variant="outlined" className="mt-4 p-6 sm:p-8">
        <h2 className="text-xl font-semibold tracking-[-0.04em]">Optional communications</h2>
        <p className="mt-2 text-sm leading-6 text-neutral-600">Optional communication preferences are not available yet. We&apos;ll only add controls here once they are backed by a saved account preference.</p>
      </Card>

      <div className="mt-10 flex flex-wrap items-end justify-between gap-4">
        <h2 className="text-2xl font-semibold tracking-[-0.04em]">History</h2>
        <p className="text-sm text-neutral-500">{notificationPage.total} {notificationPage.total === 1 ? "update" : "updates"}</p>
      </div>

      {notificationPage.notifications.length === 0 ? (
        <Card variant="outlined" className="mt-5 p-7 sm:p-9"><p className="text-lg font-semibold">You don&apos;t have any order updates yet.</p><p className="mt-2 text-sm leading-6 text-neutral-600">Updates for future orders will appear here.</p></Card>
      ) : <ol className="mt-5 space-y-3">{notificationPage.notifications.map((notification, index) => (
        <li key={`${notification.orderNumber}-${notification.createdAt}-${index}`}>
          <Card variant="outlined" className="p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2.5"><h3 className="text-lg font-semibold tracking-[-0.03em]">{notification.title}</h3><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses[notification.status]}`}>{notification.status}</span></div>
                <p className="mt-2 text-sm leading-6 text-neutral-600">{notification.status === "Failed" ? "We couldn&apos;t send this update." : notification.description}</p>
                <p className="mt-3 text-sm text-neutral-500">Created {formatDate(notification.createdAt)}{notification.sentAt ? ` · Sent ${formatDate(notification.sentAt)}` : ""}</p>
              </div>
              <Link className="inline-flex min-h-11 shrink-0 items-center rounded-full border border-neutral-300 px-4 text-sm font-semibold transition hover:border-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2" href={`/account/orders/${encodeURIComponent(notification.orderNumber)}`}>View order</Link>
            </div>
          </Card>
        </li>
      ))}</ol>}

      {notificationPage.totalPages > 1 ? <nav className="mt-7 flex items-center justify-between gap-4" aria-label="Notification pagination">
        {notificationPage.page > 1 ? <Link className="inline-flex min-h-11 items-center rounded-full border border-neutral-300 px-4 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2" href={`/account/notifications?page=${notificationPage.page - 1}`}>Previous</Link> : <span aria-hidden="true" />}
        <p className="text-sm text-neutral-600">Page {notificationPage.page} of {notificationPage.totalPages}</p>
        {notificationPage.page < notificationPage.totalPages ? <Link className="inline-flex min-h-11 items-center rounded-full border border-neutral-300 px-4 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2" href={`/account/notifications?page=${notificationPage.page + 1}`}>Next</Link> : <span aria-hidden="true" />}
      </nav> : null}
    </section>
  );
}
