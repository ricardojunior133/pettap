import Link from "next/link";

import { CheckoutConfirmationService } from "@/features/guest-commerce/services/checkout-confirmation-service";

export const dynamic = "force-dynamic";

export default async function CheckoutSuccessPage({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  const sessionId = (await searchParams).session_id;
  const orderNumber = sessionId ? await new CheckoutConfirmationService().getPaidOrderNumber(sessionId).catch(() => null) : null;
  return <main className="mx-auto flex min-h-[70vh] max-w-xl flex-col justify-center px-6 text-center"><p className="text-sm font-medium text-emerald-700">Payment received</p><h1 className="mt-3 text-4xl font-semibold tracking-tight text-neutral-950">Thank you for your order.</h1>{orderNumber ? <p className="mt-4 text-neutral-600">Order number: <span className="font-medium text-neutral-950">{orderNumber}</span></p> : null}<p className="mt-4 text-neutral-600">We&apos;ll now begin producing your personalised PetTap.</p><div className="mt-8"><Link className="inline-flex h-10 items-center justify-center rounded-xl bg-neutral-950 px-4 text-sm font-medium text-white transition-colors hover:bg-neutral-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950" href="/">Return Home</Link></div></main>;
}
