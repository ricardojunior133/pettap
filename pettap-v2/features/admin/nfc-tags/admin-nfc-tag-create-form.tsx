"use client";

import { useState, useTransition } from "react";

import { createAdminTestNfcTagAction } from "./admin-nfc-tag-provisioning-actions";

export function AdminNfcTagCreateForm() {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function createTag() {
    setMessage(null);
    startTransition(async () => {
      const result = await createAdminTestNfcTagAction();
      setMessage(result.ok
        ? `${result.tag.idempotent ? "Existing" : "New"} test tag ready: ${result.tag.publicCode} (${result.tag.accountReference}).`
        : "We couldn't create a test tag. Please try again.");
    });
  }

  return <section className="mt-8 rounded-3xl border border-black/[.07] bg-white p-5" aria-labelledby="create-test-tag-title">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div><h2 className="text-lg font-semibold" id="create-test-tag-title">Test NFC inventory</h2><p className="mt-1 max-w-2xl text-sm text-neutral-600">Creates one unassigned test tag for your current authorised admin account. It does not create a credential, activation or pet link.</p></div>
      <button className="min-h-11 rounded-xl bg-neutral-950 px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50" disabled={pending} onClick={createTag} type="button">{pending ? "Creating test tag…" : "Create test tag"}</button>
    </div>
    <p aria-live="polite" className="mt-3 min-h-5 text-sm text-neutral-700">{message}</p>
  </section>;
}
