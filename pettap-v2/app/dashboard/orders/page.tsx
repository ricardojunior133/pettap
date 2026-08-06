import type { Metadata } from "next";

import { CustomerOrdersList } from "@/features/commerce/components/CustomerOrders";
import { CustomerOrderService } from "@/features/commerce/services/customer-order-service";

export const metadata: Metadata = { title: "My orders", robots: { index: false, follow: false } };

export default async function CustomerOrdersPage({ searchParams }: { searchParams: Promise<{ page?: string; q?: string }> }) {
  const { page: rawPage, q } = await searchParams;
  const parsedPage = Number.parseInt(rawPage ?? "1", 10);
  const orders = await new CustomerOrderService().list({ page: Number.isFinite(parsedPage) ? parsedPage : 1, query: q });
  return <section><header className="max-w-2xl"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">Your purchases</p><h1 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-neutral-950 sm:text-5xl">Orders</h1><p className="mt-4 text-base leading-7 text-neutral-600">A clear record of your PetTap orders, delivery progress and saved customisation.</p></header><form className="mt-7 flex max-w-lg gap-2"><label className="sr-only" htmlFor="customer-order-search">Search your orders</label><input className="min-h-11 flex-1 rounded-xl border border-black/10 px-3" defaultValue={q} id="customer-order-search" name="q" placeholder="Order number or pet name" /><button className="min-h-11 rounded-xl bg-neutral-950 px-4 text-sm font-semibold text-white">Search</button></form><div className="mt-9"><CustomerOrdersList data={orders} /></div></section>;
}
