"use client";

import { useRef, useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronLeft, MapPin, Pencil, Plus, Star, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  createCustomerAddress,
  deleteCustomerAddress,
  setDefaultCustomerAddress,
  updateCustomerAddress,
} from "@/features/commerce/actions/customer-address-actions";
import type { CustomerAddressViewModel } from "@/features/commerce/repositories/customer-address-repository";

type AddressFormMode = { mode: "create" } | { mode: "edit"; address: CustomerAddressViewModel };
type FieldErrors = Partial<Record<"fullName" | "addressLine1" | "city" | "postcode" | "countryCode", string>>;

const fieldClassName = "h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10 aria-[invalid=true]:border-rose-600";

function formatAddressType(type: CustomerAddressViewModel["type"]) {
  return type === "shipping" ? "Shipping" : "Billing";
}

function validateAddressForm(formData: FormData): FieldErrors {
  const required = [
    ["fullName", "Enter the recipient's full name."],
    ["addressLine1", "Enter the first address line."],
    ["city", "Enter a city or town."],
    ["postcode", "Enter a postcode."],
    ["countryCode", "Enter a two-letter country code."],
  ] as const;

  const errors: FieldErrors = {};
  for (const [field, message] of required) {
    if (!String(formData.get(field) ?? "").trim()) errors[field] = message;
  }

  const countryCode = String(formData.get("countryCode") ?? "").trim();
  if (countryCode && countryCode.length !== 2) errors.countryCode = "Use a two-letter country code, such as GB.";
  return errors;
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return <p id={id} className="mt-1 text-xs text-rose-700">{message}</p>;
}

function AddressForm({
  value,
  onCancel,
  onSaved,
}: {
  value: AddressFormMode;
  onCancel: () => void;
  onSaved: (message: string) => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const editing = value.mode === "edit" ? value.address : undefined;

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isPending) return;

    const formData = new FormData(event.currentTarget);
    const errors = validateAddressForm(formData);
    setFieldErrors(errors);
    setError(null);
    if (Object.keys(errors).length) return;

    startTransition(() => {
      const action = editing ? updateCustomerAddress : createCustomerAddress;
      if (editing) formData.set("id", editing.id);

      void action(formData)
        .then(() => {
          formRef.current?.reset();
          onSaved(editing ? "Address updated." : "Address added.");
        })
        .catch(() => setError("We could not save this address. Please check the fields and try again."));
    });
  }

  return (
    <form ref={formRef} key={editing?.id ?? "new"} onSubmit={onSubmit} noValidate className="grid gap-4" aria-describedby={error ? "address-form-error" : undefined}>
      {editing ? <input type="hidden" name="id" value={editing.id} /> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5 text-sm font-medium text-neutral-800">
          Address type
          <select name="type" defaultValue={editing?.type ?? "shipping"} className={fieldClassName}>
            <option value="shipping">Shipping</option>
            <option value="billing">Billing</option>
          </select>
        </label>
        <label className="grid gap-1.5 text-sm font-medium text-neutral-800">
          Recipient / full name
          <Input name="fullName" defaultValue={editing?.fullName ?? ""} required aria-invalid={Boolean(fieldErrors.fullName)} aria-describedby={fieldErrors.fullName ? "fullName-error" : undefined} />
          <FieldError id="fullName-error" message={fieldErrors.fullName} />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5 text-sm font-medium text-neutral-800">Company <Input name="company" defaultValue={editing?.company ?? ""} /></label>
        <label className="grid gap-1.5 text-sm font-medium text-neutral-800">Phone <Input name="phone" type="tel" defaultValue={editing?.phone ?? ""} /></label>
      </div>
      <label className="grid gap-1.5 text-sm font-medium text-neutral-800">
        Address line 1
        <Input name="addressLine1" defaultValue={editing?.addressLine1 ?? ""} required aria-invalid={Boolean(fieldErrors.addressLine1)} aria-describedby={fieldErrors.addressLine1 ? "addressLine1-error" : undefined} />
        <FieldError id="addressLine1-error" message={fieldErrors.addressLine1} />
      </label>
      <label className="grid gap-1.5 text-sm font-medium text-neutral-800">Address line 2 <Input name="addressLine2" defaultValue={editing?.addressLine2 ?? ""} /></label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5 text-sm font-medium text-neutral-800">
          City
          <Input name="city" defaultValue={editing?.city ?? ""} required aria-invalid={Boolean(fieldErrors.city)} aria-describedby={fieldErrors.city ? "city-error" : undefined} />
          <FieldError id="city-error" message={fieldErrors.city} />
        </label>
        <label className="grid gap-1.5 text-sm font-medium text-neutral-800">County <Input name="county" defaultValue={editing?.county ?? ""} /></label>
      </div>
      <div className="grid gap-4 sm:grid-cols-[1fr_10rem]">
        <label className="grid gap-1.5 text-sm font-medium text-neutral-800">
          Postcode
          <Input name="postcode" defaultValue={editing?.postcode ?? ""} required aria-invalid={Boolean(fieldErrors.postcode)} aria-describedby={fieldErrors.postcode ? "postcode-error" : undefined} />
          <FieldError id="postcode-error" message={fieldErrors.postcode} />
        </label>
        <label className="grid gap-1.5 text-sm font-medium text-neutral-800">
          Country code
          <Input name="countryCode" defaultValue={editing?.countryCode ?? "GB"} maxLength={2} required aria-invalid={Boolean(fieldErrors.countryCode)} aria-describedby={fieldErrors.countryCode ? "countryCode-error" : undefined} />
          <FieldError id="countryCode-error" message={fieldErrors.countryCode} />
        </label>
      </div>
      {editing ? (
        <label className="flex items-start gap-3 rounded-xl bg-neutral-50 p-3 text-sm text-neutral-700">
          <input name="isDefault" type="hidden" value={editing.isDefault ? "on" : ""} />
          <input type="checkbox" checked={editing.isDefault} disabled className="mt-0.5 size-4 rounded border-neutral-300" />
          <span><span className="font-medium text-neutral-900">Default address</span><br />Use “Set as default” on an address card to change this selection.</span>
        </label>
      ) : (
        <label className="flex items-start gap-3 rounded-xl bg-neutral-50 p-3 text-sm text-neutral-700">
          <input name="isDefault" type="checkbox" className="mt-0.5 size-4 rounded border-neutral-300" />
          <span><span className="font-medium text-neutral-900">Make this my default address</span><br />Used when an address is needed automatically.</span>
        </label>
      )}
      {error ? <p id="address-form-error" role="alert" className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-800">{error}</p> : null}
      <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>Cancel</Button>
        <Button type="submit" disabled={isPending}>{isPending ? "Saving…" : editing ? "Save changes" : "Add address"}</Button>
      </div>
    </form>
  );
}

export function CustomerAddresses({ addresses }: { addresses: CustomerAddressViewModel[] }) {
  const router = useRouter();
  const [form, setForm] = useState<AddressFormMode | null>(null);
  const [deleting, setDeleting] = useState<CustomerAddressViewModel | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function finish(message: string) {
    setForm(null);
    setDeleting(null);
    setError(null);
    setFeedback(message);
    router.refresh();
  }

  function setDefault(id: string) {
    if (isPending) return;
    setFeedback(null);
    setError(null);
    startTransition(() => {
      const data = new FormData();
      data.set("id", id);
      void setDefaultCustomerAddress(data)
        .then(() => finish("Default address updated."))
        .catch(() => setError("We could not update your default address. Please try again."));
    });
  }

  function confirmDelete() {
    if (!deleting || isPending) return;
    setFeedback(null);
    setError(null);
    startTransition(() => {
      const data = new FormData();
      data.set("id", deleting.id);
      void deleteCustomerAddress(data)
        .then(() => finish("Address deleted."))
        .catch(() => setError("We could not delete this address. Please try again."));
    });
  }

  return (
    <section className="mx-auto w-full max-w-5xl space-y-8 pb-12">
      <header className="flex flex-col gap-5 border-b border-neutral-200 pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-neutral-500">Account settings</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-950 sm:text-4xl">Your addresses</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-neutral-600">Keep your delivery and billing details ready for when you need them.</p>
        </div>
        <Button type="button" size="lg" onClick={() => { setFeedback(null); setError(null); setForm({ mode: "create" }); }}>
          <Plus data-icon="inline-start" /> Add address
        </Button>
      </header>

      {feedback ? <p role="status" aria-live="polite" className="flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800"><Check className="size-4" />{feedback}</p> : null}
      {error ? <p role="alert" className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</p> : null}

      {form ? (
        <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-neutral-950">{form.mode === "edit" ? "Edit address" : "Add a new address"}</h2>
              <p className="mt-1 text-sm text-neutral-600">Only the details needed for delivery and billing are saved.</p>
            </div>
            <Button type="button" variant="ghost" size="icon" onClick={() => setForm(null)} aria-label="Cancel address form"><ChevronLeft /></Button>
          </div>
          <AddressForm value={form} onCancel={() => setForm(null)} onSaved={finish} />
        </div>
      ) : null}

      {addresses.length === 0 && !form ? (
        <div className="rounded-3xl border border-dashed border-neutral-300 bg-white px-6 py-14 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-neutral-100"><MapPin className="size-5 text-neutral-700" /></div>
          <h2 className="mt-5 text-xl font-semibold text-neutral-950">No saved addresses yet</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-neutral-600">Add a delivery or billing address now, so it is ready whenever you need it.</p>
          <Button type="button" className="mt-6" onClick={() => setForm({ mode: "create" })}><Plus data-icon="inline-start" /> Add your first address</Button>
        </div>
      ) : null}

      {addresses.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {addresses.map((address) => (
            <article key={address.id} className="flex min-h-64 flex-col rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-700">{formatAddressType(address.type)}</span>
                {address.isDefault ? <span className="inline-flex items-center gap-1 rounded-full bg-neutral-900 px-2.5 py-1 text-xs font-medium text-white"><Star className="size-3" fill="currentColor" /> Default</span> : null}
              </div>
              <address className="mt-5 not-italic text-sm leading-6 text-neutral-700">
                <p className="font-semibold text-neutral-950">{address.fullName}</p>
                {address.company ? <p>{address.company}</p> : null}
                <p>{address.addressLine1}</p>
                {address.addressLine2 ? <p>{address.addressLine2}</p> : null}
                <p>{address.city}{address.county ? `, ${address.county}` : ""}</p>
                <p>{address.postcode}, {address.countryCode}</p>
                {address.phone ? <p className="mt-2">{address.phone}</p> : null}
              </address>
              <div className="mt-auto flex flex-wrap gap-2 pt-5">
                <Button type="button" variant="outline" onClick={() => { setFeedback(null); setError(null); setForm({ mode: "edit", address }); }}><Pencil data-icon="inline-start" /> Edit</Button>
                {!address.isDefault ? <Button type="button" variant="outline" onClick={() => setDefault(address.id)} disabled={isPending}><Star data-icon="inline-start" /> {isPending ? "Updating…" : "Set as default"}</Button> : null}
                <Button type="button" variant="destructive" onClick={() => setDeleting(address)} disabled={isPending}><Trash2 data-icon="inline-start" /> Delete</Button>
              </div>
            </article>
          ))}
        </div>
      ) : null}

      <Dialog open={Boolean(deleting)} onOpenChange={(open) => { if (!open && !isPending) setDeleting(null); }}>
        <DialogContent showCloseButton={!isPending} aria-describedby="delete-address-description">
          <DialogHeader>
            <DialogTitle>Delete this address?</DialogTitle>
            <DialogDescription id="delete-address-description">This will remove the saved address from your account. This cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" disabled={isPending} />}>Cancel</DialogClose>
            <Button type="button" variant="destructive" onClick={confirmDelete} disabled={isPending}>{isPending ? "Deleting…" : "Delete address"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
