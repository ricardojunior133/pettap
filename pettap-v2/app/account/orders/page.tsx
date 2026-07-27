import Link from "next/link";

import Card from "@/components/ui/Card";
import {
  OrderReadService,
  type CustomerOrderStatusLabel,
  type CustomerOrdersPageViewModel,
} from "@/features/commerce/services/order-read-service";

type OrdersPageProps = {
  searchParams: Promise<{ page?: string | string[] }>;
};

const statusClasses: Record<CustomerOrderStatusLabel, string> = {
  Paid: "bg-sky-50 text-sky-800",
  "In Production": "bg-violet-50 text-violet-800",
  Printed: "bg-indigo-50 text-indigo-800",
  Packed: "bg-amber-50 text-amber-800",
  Shipped: "bg-blue-50 text-blue-800",
  Delivered: "bg-emerald-50 text-emerald-800",
  Cancelled: "bg-neutral-100 text-neutral-700",
};

function formatTotal(total: number, currency: string) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency }).format(total / 100);
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(new Date(date));
}

function getPage(value: string | string[] | undefined) {
  const candidate = Array.isArray(value) ? value[0] : value;
  const page = Number(candidate);
  return Number.isInteger(page) && page > 0 ? page : 1;
}

async function loadOrders(page: number): Promise<CustomerOrdersPageViewModel | null> {
  try {
    return await new OrderReadService().listOrders({ page });
  } catch {
    return null;
  }
}

function OrdersLoadError() {
  return (
    <section aria-labelledby="orders-heading">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">Orders</p>
      <h1 id="orders-heading" className="mt-3 text-4xl font-semibold tracking-[-0.06em]">Order history</h1>
      <Card variant="outlined" className="mt-8 p-7 sm:p-9" role="alert">
        <h2 className="text-xl font-semibold tracking-[-0.04em]">We couldn&apos;t load your orders.</h2>
        <p className="mt-3 text-sm leading-6 text-neutral-600">Please refresh the page or try again shortly.</p>
      </Card>
    </section>
  );
}

export default async function AccountOrdersPage({ searchParams }: OrdersPageProps) {
  const { page: pageParam } = await searchParams;
  const ordersPage = await loadOrders(getPage(pageParam));

  if (!ordersPage) return <OrdersLoadError />;

  return (
    <section aria-labelledby="orders-heading">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">Orders</p>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 id="orders-heading" className="text-4xl font-semibold tracking-[-0.06em]">Order history</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-neutral-600">Your orders are private and visible only to you.</p>
        </div>
        <span className="text-sm text-neutral-500">{ordersPage.total} {ordersPage.total === 1 ? "order" : "orders"}</span>
      </div>

      {ordersPage.orders.length === 0 ? (
        <Card variant="outlined" className="mt-8 p-7 sm:p-9">
          <h2 className="text-xl font-semibold tracking-[-0.04em]">You haven&apos;t placed any orders yet.</h2>
          <p className="mt-3 max-w-lg text-sm leading-6 text-neutral-600">When you do, each order and its delivery status will appear here.</p>
          <Link className="mt-6 inline-flex min-h-11 items-center rounded-full bg-neutral-950 px-5 text-sm font-semibold text-white transition hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2" href="/">
            Start shopping
          </Link>
        </Card>
      ) : (
        <div className="mt-8 space-y-3">
          {ordersPage.orders.map((order) => (
            <Card key={order.orderNumber} variant="outlined" className="p-5 sm:p-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h2 className="text-lg font-semibold tracking-[-0.03em]">#{order.orderNumber}</h2>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses[order.status]}`}>{order.status}</span>
                  </div>
                  <p className="mt-2 text-sm text-neutral-600">{formatDate(order.createdAt)} · {order.itemCount} {order.itemCount === 1 ? "item" : "items"}</p>
                  {order.trackingNumber ? <p className="mt-1 text-sm text-neutral-500">Tracking: {order.trackingNumber}</p> : null}
                </div>
                <div className="flex items-center justify-between gap-5 sm:justify-end">
                  <p className="text-base font-semibold">{formatTotal(order.total, order.currency)}</p>
                  <Link className="inline-flex min-h-11 items-center rounded-full border border-neutral-300 px-4 text-sm font-semibold transition hover:border-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2" href={`/account/orders/${encodeURIComponent(order.orderNumber)}`}>
                    View details
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {ordersPage.totalPages > 1 ? (
        <nav className="mt-7 flex items-center justify-between gap-4" aria-label="Order pagination">
          {ordersPage.page > 1 ? (
            <Link className="inline-flex min-h-11 items-center rounded-full border border-neutral-300 px-4 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2" href={`/account/orders?page=${ordersPage.page - 1}`}>
              Previous
            </Link>
          ) : <span aria-hidden="true" />}
          <p className="text-sm text-neutral-600">Page {ordersPage.page} of {ordersPage.totalPages}</p>
          {ordersPage.page < ordersPage.totalPages ? (
            <Link className="inline-flex min-h-11 items-center rounded-full border border-neutral-300 px-4 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2" href={`/account/orders?page=${ordersPage.page + 1}`}>
              Next
            </Link>
          ) : <span aria-hidden="true" />}
        </nav>
      ) : null}
    </section>
  );
}
