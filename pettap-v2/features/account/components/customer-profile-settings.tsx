"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import Card from "@/components/ui/Card";
import type { CustomerAddressViewModel } from "@/features/commerce/repositories/customer-address-repository";
import type { AccountProfileViewModel } from "../services/account-portal-service";
import { deleteCustomerAddress, saveCustomerAddress, setDefaultAddress } from "../actions/customer-address-actions";
import { updateCustomerProfile } from "../actions/customer-profile-actions";

type Props = { profile: AccountProfileViewModel; addresses: CustomerAddressViewModel[] };

const inputClass = "mt-1 min-h-11 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-neutral-950 focus:ring-2 focus:ring-neutral-950/15";

function formatDate(value: string | null) {
  return value ? new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" }).format(new Date(value)) : "Not available";
}

export function CustomerProfileSettings({ profile, addresses }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [editing, setEditing] = useState<CustomerAddressViewModel | "new" | null>(null);

  function run(task: () => Promise<unknown>, success: string) {
    startTransition(async () => {
      try { await task(); setMessage(success); setEditing(null); router.refresh(); }
      catch { setMessage("We couldn't save your changes. Please check the details and try again."); }
    });
  }

  return (
    <div className="mt-8 space-y-6">
      {message ? <p className="rounded-2xl bg-neutral-950 px-4 py-3 text-sm font-medium text-white" role="status">{message}</p> : null}
      <Card variant="surface" className="p-6 sm:p-8">
        <h2 className="text-xl font-semibold tracking-[-0.04em]">Personal details</h2>
        <form className="mt-5 grid gap-4 sm:grid-cols-2" onSubmit={(event) => { event.preventDefault(); run(() => updateCustomerProfile(new FormData(event.currentTarget)), "Profile updated."); }}>
          <label className="text-sm font-medium">Name<input className={inputClass} name="displayName" defaultValue={profile.displayName} required maxLength={120} /></label>
          <label className="text-sm font-medium">Phone <span className="font-normal text-neutral-500">(optional)</span><input className={inputClass} name="phone" defaultValue={profile.phone ?? ""} maxLength={32} /></label>
          <label className="text-sm font-medium sm:col-span-2">Email<input className={`${inputClass} cursor-not-allowed bg-neutral-50 text-neutral-500`} value={profile.email ?? "Not available"} readOnly aria-readonly="true" /></label>
          <div className="sm:col-span-2"><button className="min-h-11 rounded-full bg-neutral-950 px-5 text-sm font-semibold text-white disabled:opacity-50" disabled={pending} type="submit">{pending ? "Saving…" : "Save profile"}</button></div>
        </form>
      </Card>

      <Card variant="outlined" className="p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4"><div><h2 className="text-xl font-semibold tracking-[-0.04em]">Addresses</h2><p className="mt-1 text-sm text-neutral-600">Your saved delivery and billing addresses.</p></div><button className="min-h-11 rounded-full border border-neutral-300 px-4 text-sm font-semibold" type="button" onClick={() => setEditing("new")}>Add address</button></div>
        {addresses.length === 0 ? <p className="mt-6 rounded-2xl bg-neutral-50 p-5 text-sm text-neutral-600">No address added yet.</p> : <div className="mt-5 grid gap-3">{addresses.map((address) => <div key={address.id} className="rounded-2xl border border-neutral-200 p-4"><div className="flex flex-wrap justify-between gap-3"><div><p className="font-semibold">{address.fullName} {address.isDefault ? <span className="ml-2 rounded-full bg-neutral-950 px-2 py-1 text-xs text-white">Default</span> : null}</p><p className="mt-1 text-sm text-neutral-600">{address.addressLine1}, {address.city}, {address.postcode}, {address.countryCode}</p></div><div className="flex gap-2"><button className="text-sm font-semibold underline" type="button" onClick={() => setEditing(address)}>Edit</button>{!address.isDefault ? <button className="text-sm font-semibold underline" disabled={pending} type="button" onClick={() => run(() => setDefaultAddress(address.id), "Default address updated.")}>Set default</button> : null}<button className="text-sm font-semibold text-rose-700 underline" disabled={pending} type="button" onClick={() => { if (window.confirm("Remove this address?")) run(() => deleteCustomerAddress(address.id), "Address removed."); }}>Remove</button></div></div></div>)}</div>}
        {editing ? <AddressForm address={editing === "new" ? null : editing} pending={pending} onCancel={() => setEditing(null)} onSave={(formData) => run(() => saveCustomerAddress(formData), editing === "new" ? "Address added." : "Address updated.")} /> : null}
      </Card>

      <Card variant="outlined" className="p-6 sm:p-8"><h2 className="text-xl font-semibold tracking-[-0.04em]">Preferences</h2><dl className="mt-5 grid gap-4 text-sm sm:grid-cols-3"><div><dt className="text-neutral-500">Language</dt><dd className="mt-1 font-semibold">{profile.preferences.language ?? "Not configured"}</dd></div><div><dt className="text-neutral-500">Time zone</dt><dd className="mt-1 font-semibold">{profile.preferences.timeZone ?? "Not configured"}</dd></div><div><dt className="text-neutral-500">Communications</dt><dd className="mt-1 font-semibold">{profile.preferences.communications ?? "Not configured"}</dd></div></dl></Card>
      <Card variant="outlined" className="p-6 sm:p-8"><h2 className="text-xl font-semibold tracking-[-0.04em]">Security</h2><dl className="mt-5 grid gap-4 text-sm sm:grid-cols-3"><div><dt className="text-neutral-500">Email</dt><dd className="mt-1 font-semibold">{profile.emailVerified ? "Verified" : "Not verified"}</dd></div><div><dt className="text-neutral-500">Account created</dt><dd className="mt-1 font-semibold">{formatDate(profile.createdAt)}</dd></div><div><dt className="text-neutral-500">Last sign in</dt><dd className="mt-1 font-semibold">{formatDate(profile.lastSignInAt)}</dd></div></dl><a className="mt-6 inline-flex min-h-11 items-center rounded-full border border-neutral-300 px-4 text-sm font-semibold" href="/login">Change password</a></Card>
    </div>
  );
}

function AddressForm({ address, pending, onCancel, onSave }: { address: CustomerAddressViewModel | null; pending: boolean; onCancel: () => void; onSave: (formData: FormData) => void }) {
  return <form className="mt-6 grid gap-3 rounded-2xl bg-neutral-50 p-4 sm:grid-cols-2" onSubmit={(event) => { event.preventDefault(); onSave(new FormData(event.currentTarget)); }}>
    <input type="hidden" name="id" value={address?.id ?? ""} /><label className="text-sm font-medium">Full name<input className={inputClass} name="fullName" required defaultValue={address?.fullName ?? ""} /></label><label className="text-sm font-medium">Phone<input className={inputClass} name="phone" defaultValue={address?.phone ?? ""} /></label><label className="text-sm font-medium sm:col-span-2">Address line 1<input className={inputClass} name="addressLine1" required defaultValue={address?.addressLine1 ?? ""} /></label><label className="text-sm font-medium sm:col-span-2">Address line 2<input className={inputClass} name="addressLine2" defaultValue={address?.addressLine2 ?? ""} /></label><label className="text-sm font-medium">City<input className={inputClass} name="city" required defaultValue={address?.city ?? ""} /></label><label className="text-sm font-medium">Postcode<input className={inputClass} name="postcode" required defaultValue={address?.postcode ?? ""} /></label><label className="text-sm font-medium">Country code<input className={inputClass} name="countryCode" required defaultValue={address?.countryCode ?? "GB"} maxLength={2} /></label><label className="text-sm font-medium">Type<select className={inputClass} name="type" defaultValue={address?.type ?? "shipping"}><option value="shipping">Shipping</option><option value="billing">Billing</option></select></label><label className="flex items-center gap-2 text-sm font-medium sm:col-span-2"><input name="isDefault" type="checkbox" defaultChecked={address?.isDefault ?? false} /> Set as default</label><input name="company" type="hidden" value={address?.company ?? ""} /><input name="county" type="hidden" value={address?.county ?? ""} /><div className="flex gap-3 sm:col-span-2"><button className="min-h-11 rounded-full bg-neutral-950 px-5 text-sm font-semibold text-white disabled:opacity-50" disabled={pending} type="submit">{pending ? "Saving…" : "Save address"}</button><button className="min-h-11 rounded-full border border-neutral-300 px-5 text-sm font-semibold" type="button" onClick={onCancel}>Cancel</button></div>
  </form>;
}
