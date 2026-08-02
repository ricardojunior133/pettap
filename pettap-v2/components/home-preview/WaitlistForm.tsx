"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight, Check } from "lucide-react";

import { waitlistService } from "@/lib/waitlist/service";

type FormStatus = "idle" | "loading" | "success" | "error";

export default function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<FormStatus>("idle");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setStatus("error");
      setMessage("Enter a valid email address.");
      return;
    }

    setStatus("loading");
    const result = await waitlistService.subscribe(email);

    if (result.status === "subscribed") {
      setStatus("success");
      setMessage("You're on the list. We'll be in touch soon.");
      return;
    }

    setStatus("error");
    setMessage(result.message);
  }

  if (status === "success") {
    return <div role="status" className="flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-neutral-950 px-5 text-sm font-semibold text-white"><Check className="size-4" aria-hidden="true" />{message}</div>;
  }

  return <form onSubmit={submit} noValidate className="mx-auto flex max-w-xl flex-col gap-3 sm:flex-row"><label className="sr-only" htmlFor="waitlist-email">Email address</label><input id="waitlist-email" type="email" value={email} onChange={(event) => { setEmail(event.target.value); setStatus("idle"); }} placeholder="Email address" autoComplete="email" disabled={status === "loading"} className="min-h-14 min-w-0 flex-1 rounded-2xl border border-black/[0.10] bg-white px-5 text-base text-neutral-950 outline-none transition placeholder:text-neutral-400 focus:border-neutral-950 focus:ring-4 focus:ring-neutral-950/10 disabled:opacity-60" /><button type="submit" disabled={status === "loading"} className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-neutral-950 px-6 text-sm font-semibold text-white transition hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-neutral-950/15 disabled:cursor-wait disabled:opacity-70">{status === "loading" ? "Saving..." : "Notify Me"}<ArrowRight className="size-4" aria-hidden="true" /></button>{status === "error" && <p role="alert" className="basis-full text-left text-sm text-red-700">{message}</p>}</form>;
}
