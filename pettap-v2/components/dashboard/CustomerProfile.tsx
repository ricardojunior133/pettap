"use client";

import { useActionState } from "react";
import { Check, LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { initialCustomerProfileActionState, updateCustomerProfile } from "@/features/owner/actions/customer-profile-actions";
import type { CustomerProfileViewModel } from "@/features/owner/schemas/customer-profile";

function FieldError({ fieldErrors, name }: { fieldErrors?: Record<string, string[]>; name: string }) {
  const message = fieldErrors?.[name]?.[0];
  if (!message) return null;
  return <p id={`${name}-error`} className="mt-1 text-xs text-rose-700">{message}</p>;
}

export function CustomerProfile({ profile }: { profile: CustomerProfileViewModel }) {
  const [state, formAction, pending] = useActionState(updateCustomerProfile, initialCustomerProfileActionState);
  const fieldErrors = state.status === "error" ? state.fieldErrors : undefined;

  return (
    <section className="mx-auto w-full max-w-3xl pb-12">
      <header className="border-b border-neutral-200 pb-8">
        <p className="text-sm font-medium text-neutral-500">Account settings</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-950 sm:text-4xl">Your profile</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600">Keep your contact details accurate so PetTap can support your account when you need us.</p>
      </header>

      <form action={formAction} className="mt-8 rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-7" noValidate>
        <div className="grid gap-5">
          <div>
            <label htmlFor="displayName" className="text-sm font-medium text-neutral-900">Full name</label>
            <input id="displayName" name="displayName" defaultValue={profile.displayName} autoComplete="name" required aria-invalid={Boolean(fieldErrors?.displayName)} aria-describedby={fieldErrors?.displayName ? "displayName-error" : undefined} className="mt-2 h-11 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm text-neutral-950 outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10 aria-[invalid=true]:border-rose-600" />
            <FieldError fieldErrors={fieldErrors} name="displayName" />
          </div>

          <div>
            <label htmlFor="email" className="text-sm font-medium text-neutral-900">Email address</label>
            <input id="email" value={profile.email} readOnly aria-readonly="true" className="mt-2 h-11 w-full cursor-not-allowed rounded-xl border border-neutral-200 bg-neutral-50 px-3 text-sm text-neutral-600" />
            <p className="mt-2 text-xs leading-5 text-neutral-500">Your sign-in email is managed securely through your account and cannot be changed here.</p>
          </div>

          <div>
            <label htmlFor="phone" className="text-sm font-medium text-neutral-900">Phone number <span className="font-normal text-neutral-500">(optional)</span></label>
            <input id="phone" name="phone" type="tel" defaultValue={profile.phone ?? ""} autoComplete="tel" aria-invalid={Boolean(fieldErrors?.phone)} aria-describedby={fieldErrors?.phone ? "phone-error" : undefined} className="mt-2 h-11 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm text-neutral-950 outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10 aria-[invalid=true]:border-rose-600" />
            <FieldError fieldErrors={fieldErrors} name="phone" />
          </div>

          <div>
            <label htmlFor="preferredLanguage" className="text-sm font-medium text-neutral-900">Preferred language</label>
            <select id="preferredLanguage" name="preferredLanguage" defaultValue={profile.preferredLanguage} aria-invalid={Boolean(fieldErrors?.preferredLanguage)} aria-describedby={fieldErrors?.preferredLanguage ? "preferredLanguage-error language-help" : "language-help"} className="mt-2 h-11 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm text-neutral-950 outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10 aria-[invalid=true]:border-rose-600">
              <option value="en-GB">English (United Kingdom)</option>
            </select>
            <p id="language-help" className="mt-2 text-xs leading-5 text-neutral-500">English (United Kingdom) is the currently supported PetTap experience.</p>
            <FieldError fieldErrors={fieldErrors} name="preferredLanguage" />
          </div>
        </div>

        {state.status === "success" ? <p role="status" aria-live="polite" className="mt-6 flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800"><Check className="size-4" />{state.message}</p> : null}
        {state.status === "error" && !state.fieldErrors ? <p role="alert" className="mt-6 rounded-xl bg-rose-50 px-3 py-2.5 text-sm text-rose-800">{state.message}</p> : null}

        <div className="mt-7 flex justify-end border-t border-neutral-100 pt-5">
          <Button type="submit" disabled={pending} aria-disabled={pending}>{pending ? <LoaderCircle className="animate-spin" data-icon="inline-start" /> : null}{pending ? "Saving…" : "Save changes"}</Button>
        </div>
      </form>
    </section>
  );
}
