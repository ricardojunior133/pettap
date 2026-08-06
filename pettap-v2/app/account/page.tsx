import Link from "next/link";
import { Activity, Package, PawPrint, Tag } from "lucide-react";

import Card from "@/components/ui/Card";
import { CustomerOrderService } from "@/features/commerce/services/customer-order-service";
import { PetService } from "@/features/pets/services/pet-service";
import { TagService } from "@/features/tags/services/tag-service";
import { getCurrentUser } from "@/lib/backend/auth/get-current-user";

const cards = [
  ["Pets", "Your companion profiles", PawPrint, "/account/pets"], ["Tags", "NFC tags in your account", Tag, "/account/tags"], ["Orders", "Purchases and delivery", Package, "/account/orders"], ["Active products", "Ready PetTap products", Activity, "/account/tags"],
] as const;

export default async function AccountPage() {
  const [pets, tags, orderData, user] = await Promise.all([new PetService().listPets(), new TagService().list(), new CustomerOrderService().list({ page: 1 }), getCurrentUser()]);
  const name = String(user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? user?.email?.split("@")[0] ?? "there").split(" ")[0];
  const counts = [pets.length, tags.length, orderData.total, tags.filter((tag) => tag.status === "active").length];
  return <section><header><p className="text-xs font-semibold uppercase tracking-[.18em] text-neutral-500">Your account</p><h1 className="mt-3 text-3xl font-semibold tracking-[-.05em] sm:text-5xl">Welcome back, {name} <span aria-hidden="true">👋</span></h1><p className="mt-4 max-w-xl text-base leading-7 text-neutral-600">Everything you need to manage your pets, PetTap tags and orders.</p></header><div className="mt-9 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(([title, description, Icon, href], index) => <Link key={title} href={href} className="group focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-neutral-950/15"><Card variant="surface" className="h-full p-5 transition group-hover:-translate-y-0.5 group-hover:shadow-md"><Icon className="size-5 text-neutral-500" aria-hidden="true" /><p className="mt-6 text-3xl font-semibold tracking-[-.05em]">{counts[index]}</p><h2 className="mt-2 font-semibold">{title}</h2><p className="mt-1 text-sm leading-5 text-neutral-600">{description}</p></Card></Link>)}</div><section className="mt-10 rounded-3xl border border-black/[0.07] bg-white p-6 sm:p-8"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[.16em] text-neutral-500">Recent orders</p><h2 className="mt-2 text-2xl font-semibold tracking-[-.04em]">Your latest activity</h2></div><Link className="text-sm font-semibold underline underline-offset-4" href="/account/orders">View all orders</Link></div>{orderData.orders.length ? <ul className="mt-6 divide-y divide-black/[0.06]">{orderData.orders.slice(0, 3).map((order) => <li key={order.orderId} className="flex items-center justify-between gap-4 py-4 first:pt-0"><div><p className="font-semibold">{order.orderNumber}</p><p className="mt-1 text-sm text-neutral-600">{order.itemCount} item{order.itemCount === 1 ? "" : "s"} · {order.fulfilmentStatus.replaceAll("_", " ")}</p></div><Link className="rounded-xl px-3 py-2 text-sm font-semibold hover:bg-neutral-100" href={`/account/orders/${order.orderId}`}>View</Link></li>)}</ul> : <div className="mt-6 rounded-2xl bg-neutral-50 p-6"><p className="font-semibold">Your first PetTap is waiting.</p><p className="mt-1 text-sm text-neutral-600">Design a tag that is made for your companion.</p><Link href="/studio" className="mt-4 inline-flex rounded-xl bg-neutral-950 px-4 py-2.5 text-sm font-semibold text-white">Start Designing</Link></div>}</section></section>;
}
