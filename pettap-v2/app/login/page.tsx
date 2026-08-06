import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthForm } from "@/components/auth/AuthForm";
import { getCurrentUser } from "@/lib/backend/auth/get-current-user";

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/dashboard");

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-5 py-12">
      <section className="w-full max-w-md rounded-[28px] border border-black/[0.07] bg-white p-6 shadow-[0_16px_50px_rgba(0,0,0,0.06)] sm:p-9">
        <Link className="text-xl font-semibold tracking-[-0.05em] text-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950" href="/">
          PetTap
        </Link>
        <p className="mt-9 text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">Your account</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-neutral-950">Welcome back</h1>
        <p className="mt-3 text-sm leading-6 text-neutral-600">Sign in to manage the PetTags and pets you care for.</p>
        <AuthForm mode="login" />
        <p className="mt-6 text-center text-sm text-neutral-600">New to PetTap? <Link className="font-medium text-neutral-950 underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950" href="/register">Create an account</Link></p>
      </section>
    </main>
  );
}
