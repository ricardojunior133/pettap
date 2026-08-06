import Link from "next/link";

export default function CheckoutPage() {
  return <main className="mx-auto flex min-h-[70vh] max-w-xl flex-col justify-center px-6 text-center"><p className="text-sm font-medium text-neutral-500">PetTap checkout</p><h1 className="mt-3 text-4xl font-semibold tracking-tight text-neutral-950">Your PetTap is waiting.</h1><p className="mt-4 text-neutral-600">Return to the Studio to review your configuration and continue securely with Stripe Checkout.</p><div className="mt-8"><Link className="inline-flex h-10 items-center justify-center rounded-xl bg-neutral-950 px-4 text-sm font-medium text-white transition-colors hover:bg-neutral-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950" href="/studio">Return to Studio</Link></div></main>;
}
