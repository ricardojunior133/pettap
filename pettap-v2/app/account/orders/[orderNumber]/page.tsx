import Link from "next/link";
import { notFound } from "next/navigation";

import Card from "@/components/ui/Card";
import {
  OrderReadService,
  type CustomerOrderStatusLabel,
} from "@/features/commerce/services/order-read-service";
import { launchConfig } from "@/lib/launch/config";

const statusClasses: Record<CustomerOrderStatusLabel, string> = {
  Paid: "bg-sky-50 text-sky-800",
  "In Production": "bg-violet-50 text-violet-800",
  Printed: "bg-indigo-50 text-indigo-800",
  Packed: "bg-amber-50 text-amber-800",
  Shipped: "bg-blue-50 text-blue-800",
  Delivered: "bg-emerald-50 text-emerald-800",
  Cancelled: "bg-neutral-100 text-neutral-700",
};

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency }).format(amount / 100);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" }).format(new Date(value));
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function readablePersonalisationKey(key: string) {
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (value) => value.toUpperCase());
}

export default async function AccountOrderDetailPage({ params }: { params: Promise<{ orderNumber: string }> }) {
  const { orderNumber } = await params;
  const order = await new OrderReadService().getOrderDetail(orderNumber);

  // The same not-found response is used for missing, malformed, and unowned orders.
  if (!order) notFound();

  return (
    <section aria-labelledby="order-heading">
      <Link className="inline-flex min-h-11 items-center text-sm font-semibold underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2" href="/account/orders">
        Back to orders
      </Link>

      <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">Order</p>
          <h1 id="order-heading" className="mt-2 text-4xl font-semibold tracking-[-0.06em]">#{order.orderNumber}</h1>
          <p className="mt-3 text-sm text-neutral-600">Placed on {formatDate(order.createdAt)}</p>
        </div>
        <span className={`rounded-full px-3 py-1.5 text-sm font-semibold ${statusClasses[order.status]}`}>{order.status}</span>
      </div>

      <div className="mt-8 grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(18rem,0.8fr)]">
        <div className="space-y-5">
          <Card variant="outlined" className="p-5 sm:p-7">
            <h2 className="text-xl font-semibold tracking-[-0.04em]">Items</h2>
            <div className="mt-5 divide-y divide-neutral-200">
              {order.items.map((item, index) => (
                <article key={`${item.sku}-${index}`} className="py-5 first:pt-0 last:pb-0">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold">{item.productName}</h3>
                      <p className="mt-1 text-sm text-neutral-600">{item.variantName} · {item.quantity} {item.quantity === 1 ? "item" : "items"}</p>
                      <p className="mt-1 text-xs font-medium uppercase tracking-[0.12em] text-neutral-500">SKU {item.sku}</p>
                    </div>
                    <p className="font-semibold">{formatMoney(item.lineTotal, order.currency)}</p>
                  </div>
                  {Object.keys(item.personalisation).length > 0 ? (
                    <dl className="mt-4 grid gap-x-6 gap-y-2 rounded-2xl bg-neutral-50 p-4 text-sm sm:grid-cols-2">
                      {Object.entries(item.personalisation).map(([key, value]) => (
                        <div key={key} className="flex justify-between gap-4 sm:block">
                          <dt className="text-neutral-500">{readablePersonalisationKey(key)}</dt>
                          <dd className="font-medium text-neutral-900">{value}</dd>
                        </div>
                      ))}
                    </dl>
                  ) : null}
                  <p className="mt-4 text-sm text-neutral-600">{formatMoney(item.unitPrice, order.currency)} each</p>
                </article>
              ))}
            </div>
          </Card>

          {order.tracking ? (
            <Card variant="outlined" className="p-5 sm:p-7">
              <h2 className="text-xl font-semibold tracking-[-0.04em]">Delivery</h2>
              <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
                {order.tracking.carrier ? <div><dt className="text-neutral-500">Carrier</dt><dd className="mt-1 font-semibold">{order.tracking.carrier}</dd></div> : null}
                <div><dt className="text-neutral-500">Tracking number</dt><dd className="mt-1 font-semibold">{order.tracking.number}</dd></div>
                {order.tracking.shippedAt ? <div><dt className="text-neutral-500">Dispatched</dt><dd className="mt-1 font-semibold">{formatDateTime(order.tracking.shippedAt)}</dd></div> : null}
                {order.tracking.deliveredAt ? <div><dt className="text-neutral-500">Delivered</dt><dd className="mt-1 font-semibold">{formatDateTime(order.tracking.deliveredAt)}</dd></div> : null}
              </dl>
            </Card>
          ) : null}
        </div>

        <aside className="space-y-5">
          <Card variant="surface" className="p-5 sm:p-7">
            <h2 className="text-xl font-semibold tracking-[-0.04em]">Order summary</h2>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between gap-5"><dt className="text-neutral-600">Subtotal</dt><dd>{formatMoney(order.subtotal, order.currency)}</dd></div>
              <div className="flex justify-between gap-5"><dt className="text-neutral-600">Shipping</dt><dd>{formatMoney(order.shippingTotal, order.currency)}</dd></div>
              {order.discountTotal > 0 ? <div className="flex justify-between gap-5 text-emerald-700"><dt>Discount</dt><dd>−{formatMoney(order.discountTotal, order.currency)}</dd></div> : null}
              {order.taxTotal > 0 ? <div className="flex justify-between gap-5"><dt className="text-neutral-600">Tax</dt><dd>{formatMoney(order.taxTotal, order.currency)}</dd></div> : null}
              <div className="flex justify-between gap-5 border-t border-neutral-200 pt-4 text-base font-semibold"><dt>Total</dt><dd>{formatMoney(order.total, order.currency)}</dd></div>
            </dl>
          </Card>

          <Card variant="outlined" className="p-5 sm:p-7">
            <h2 className="text-xl font-semibold tracking-[-0.04em]">Need help?</h2>
            <p className="mt-3 text-sm leading-6 text-neutral-600">Our team can help with this order. Please include your order number when you get in touch.</p>
            <a className="mt-5 inline-flex min-h-11 items-center rounded-full border border-neutral-300 px-4 text-sm font-semibold transition hover:border-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2" href={`mailto:${launchConfig.contactEmail}?subject=${encodeURIComponent(`Help with order ${order.orderNumber}`)}`}>
              Contact PetTap
            </a>
          </Card>
        </aside>
      </div>
    </section>
  );
}
