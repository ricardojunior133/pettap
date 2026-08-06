"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { studioColours } from "@/lib/studio/options";
import type { StudioConfiguration } from "@/lib/studio/types";

export function StudioCheckoutDialog({ studio, onClose }: { studio: StudioConfiguration; onClose: () => void }) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function submit(formData: FormData) {
    const colour = studioColours.find((item) => item.value === studio.colour);
    if (!studio.collection || !colour) { setMessage("Please complete your PetTap configuration first."); return; }
    const accentColour = studio.lineColour === "#C7C7CC" ? "silver" : studio.lineColour === "#C99B45" ? "gold" : studio.lineColour === "#111111" ? "black" : "white";
    setMessage(null);
    startTransition(async () => {
      try {
        const configuration = {
          collection: studio.collection,
          ...(studio.collection === "seasonal" && studio.season ? { season: studio.season } : {}),
          shape: studio.design,
          colour: colour.id,
          lineColour: accentColour,
          primaryColour: colour.id,
          accentColour,
          size: studio.size,
          finish: studio.finish,
          petName: studio.petName,
        };
        // Keep checkout-only infrastructure out of the initial Studio bundle.
        const { startStripeCheckout } = await import("@/features/guest-commerce/actions/guest-checkout-actions");
        const result = await startStripeCheckout({ configuration, customer: { email: formData.get("email"), fullName: formData.get("fullName"), shippingAddress: { fullName: formData.get("fullName"), addressLine1: formData.get("addressLine1"), addressLine2: formData.get("addressLine2") || undefined, city: formData.get("city"), county: formData.get("county") || undefined, postcode: formData.get("postcode"), countryCode: "GB", phone: formData.get("phone") || undefined } } });
        window.location.assign(result.url);
      } catch { setMessage("We couldn't start checkout. Please review your details and try again."); }
    });
  }

  return <div className="fixed inset-0 z-50 flex items-end bg-black/35 p-3 sm:items-center sm:justify-center" role="presentation"><div role="dialog" aria-modal="true" aria-labelledby="checkout-title" className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-7"><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-medium text-neutral-500">Secure checkout</p><h2 id="checkout-title" className="mt-1 text-2xl font-semibold tracking-tight">Delivery details</h2></div><button type="button" onClick={onClose} className="rounded-lg px-2 py-1 text-sm text-neutral-600 hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900">Close</button></div><p className="mt-3 text-sm text-neutral-600">You&apos;ll complete payment securely on Stripe.</p><form action={submit} className="mt-6 grid gap-4 sm:grid-cols-2"><label className="grid gap-1.5 text-sm font-medium sm:col-span-2">Email<input required name="email" type="email" className="rounded-lg border border-neutral-300 px-3 py-2.5" /></label><label className="grid gap-1.5 text-sm font-medium sm:col-span-2">Full name<input required name="fullName" className="rounded-lg border border-neutral-300 px-3 py-2.5" /></label><label className="grid gap-1.5 text-sm font-medium sm:col-span-2">Address line 1<input required name="addressLine1" className="rounded-lg border border-neutral-300 px-3 py-2.5" /></label><label className="grid gap-1.5 text-sm font-medium sm:col-span-2">Address line 2 <span className="font-normal text-neutral-500">(optional)</span><input name="addressLine2" className="rounded-lg border border-neutral-300 px-3 py-2.5" /></label><label className="grid gap-1.5 text-sm font-medium">Town or city<input required name="city" className="rounded-lg border border-neutral-300 px-3 py-2.5" /></label><label className="grid gap-1.5 text-sm font-medium">Postcode<input required name="postcode" className="rounded-lg border border-neutral-300 px-3 py-2.5" /></label><label className="grid gap-1.5 text-sm font-medium">County <span className="font-normal text-neutral-500">(optional)</span><input name="county" className="rounded-lg border border-neutral-300 px-3 py-2.5" /></label><label className="grid gap-1.5 text-sm font-medium">Phone <span className="font-normal text-neutral-500">(optional)</span><input name="phone" type="tel" className="rounded-lg border border-neutral-300 px-3 py-2.5" /></label>{message ? <p className="sm:col-span-2 text-sm text-red-700" role="alert">{message}</p> : null}<div className="mt-2 flex gap-3 sm:col-span-2"><Button type="button" variant="ghost" onClick={onClose}>Cancel</Button><Button type="submit" variant="primary" loading={pending} disabled={pending}>Continue to Stripe</Button></div></form></div></div>;
}
